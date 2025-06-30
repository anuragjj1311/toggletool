class ToggleService
  include Optionable
  def initialize(params)
    @params = params
  end

  def tabs_for_toggle
    toggle = Toggle.find(@params[:id])
    associations = toggle.tab_toggle_associations.where(deleted_at: nil).includes(:tab, :link_generator)
    associations = associations.active if @params[:current] == 'true'
    associations = associations.by_region(@params[:region]) if @params[:region].present?

    tabs_data = associations.map do |association|
      {
        id: association.tab.id,
        title: association.tab.title,
        start_date: association.start_date,
        end_date: association.end_date,
        regions: association.regions,
        link_type: association.link_type,
        links: generate_links_for_association(association)
      }
    end

    {
      id: toggle.id,
      title: toggle.title,
      type: toggle.toggle_type,
      tabs: tabs_data
    }
  end

  def index
    tab = Tab.find(@params[:tab_id])
    associations = tab.tab_toggle_associations.includes(:linked_toggle, :link_generator)
    associations = associations.active if @params[:current] == 'true'
    associations.map { |a| format_association_response(a) }
  end

  def show
    tab = Tab.find(@params[:tab_id])
    toggle = Toggle.find(@params[:id])
    association = tab.tab_toggle_associations.find_by!(linked_toggle: toggle)
    format_association_response(association)
  end

  def create
    tab = Tab.find(@params[:tab_id])
    toggle_params = @params[:toggle]
    ActiveRecord::Base.transaction do
      toggle = Toggle.new(toggle_params.except(:route_info, :regions, :start_date, :end_date, :image_url))
      raise ActiveRecord::Rollback unless toggle.save

      association = tab.tab_toggle_associations.build(
        toggle_id: toggle.id,
        toggle_type: toggle_params[:toggle_type].to_s.upcase,
        link_type: toggle_params.dig(:route_info, :link_type) || 'DIRECT',
        start_date: toggle_params[:start_date],
        end_date: toggle_params[:end_date],
        regions: toggle_params[:regions],
        image_url: toggle_params[:image_url]
      )

      if toggle_params[:route_info].present?
        link_type_class = toggle_params[:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
        association.build_link_generator(
          type: link_type_class,
          url: toggle_params[:route_info][:url]
        )
      end

      association.assign_attributes(
        toggle_type: toggle_params[:toggle_type].to_s.upcase,
        link_type: toggle_params.dig(:route_info, :link_type) || 'DIRECT',
        start_date: toggle_params[:start_date],
        end_date: toggle_params[:end_date],
        regions: toggle_params[:regions],
        image_url: toggle_params[:image_url]
      )

      raise ActiveRecord::Rollback unless association.save
      format_association_response(association)
    end
  end

  def update
    toggle = Toggle.find(@params[:id])
    toggle_params = @params[:toggle]
    if toggle.update(toggle_params.except(:route_info, :regions, :start_date, :end_date, :image_url))
      toggle.as_json(only: [:id, :title, :toggle_type])
    else
      { error: toggle.errors.full_messages.join(', ') }
    end
  end

  def destroy
    toggle = Toggle.find(@params[:id])
    toggle.soft_delete!
    { message: 'Toggle soft deleted successfully' }
  end

  def restore
    toggle = Toggle.unscoped.find(@params[:id])
    if @params[:tab_id].present?
      tab = Tab.find(@params[:tab_id])
      association = tab.tab_toggle_associations.find_by!(linked_toggle: toggle)
      toggle.restore!
      format_association_response(association)
    else
      restore_all_associations(toggle)
    end
  end

  def reset
    tab = Tab.find(@params[:tab_id])
    toggle = Toggle.find(@params[:id])
    toggle.reset_to_default!
    association = tab.tab_toggle_associations.find_by!(linked_toggle: toggle)
    format_association_response(association)
  end

  private

  def restore_all_associations(toggle)
    toggle.restore!
    Tab.find_each do |tab|
      association = tab.tab_toggle_associations.unscoped.find_or_initialize_by(toggle_id: toggle.id)
      if association.new_record?
        association.assign_attributes(
          toggle_type: toggle.toggle_type,
          link_type: 'DIRECT',
          start_date: tab.start_date,
          end_date: tab.end_date,
          regions: tab.regions || [],
          image_url: tab.image_url
        )
        association.save!
      else
        association.restore!
      end
    end
    associations = toggle.tab_toggle_associations.where(deleted_at: nil).includes(:tab)
    tabs_data = associations.map do |association|
      {
        tab_id: association.tab.id,
        tab_title: association.tab.title,
        association_id: association.id
      }
    end
    {
      toggle_id: toggle.id,
      title: toggle.title,
      restored_tabs: tabs_data
    }
  end

  def generate_links_for_association(association)
    return { 'default' => '#' } unless association.link_generator
    url = association.link_generator.url
    # Flatten nested 'default' keys
    while url.is_a?(Hash) && url.keys == ['default']
      url = url['default']
    end
    case association.link_type
    when 'DIRECT'
      { 'default' => url }
    when 'ACTIVITY'
      url.is_a?(Hash) ? url : { 'default' => url }
    else
      { 'default' => '#' }
    end
  end

  def format_association_response(association)
    links = generate_links_for_association(association)
    {
      id: association.linked_toggle.id,
      title: association.linked_toggle.title,
      type: association.toggle_type,
      image_url: association.image_url,
      start_date: association.start_date,
      end_date: association.end_date,
      regions: association.regions,
      link_type: association.link_type,
      links: links,
      deleted_at: association.linked_toggle.deleted_at
    }
  end
end