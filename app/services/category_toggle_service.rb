class CategoryToggleService
  def initialize(params)
    @params = params
  end

  def index
    tab = Tab.find(@params[:tab_id])
    category_associations = tab.tab_toggle_associations
      .where(toggle_type: 'Category')
      .includes(linked_toggle: :link_generator)
    category_associations.as_json(include: { linked_toggle: { include: :link_generator } })
  end

  def show
    tab = Tab.find(@params[:tab_id])
    association = tab.tab_toggle_associations.joins(:linked_toggle)
      .where(toggle_type: 'Category', linked_toggles: { id: @params[:id] })
      .includes(linked_toggle: :link_generator)
      .first!
    association.as_json(include: { linked_toggle: { include: :link_generator } })
  end

  def create
    tab = Tab.find(@params[:tab_id])
    toggle_params = @params[:toggle]
    toggle_params[:toggle_type] = 'Category'
    ActiveRecord::Base.transaction do
      toggle = Toggle.new(toggle_params.except(:route_info, :regions, :start_date, :end_date))
      toggle.route_info = toggle_params[:route_info] if toggle_params[:route_info].present?
      unless toggle.save
        return { error: toggle.errors.full_messages.join(', ') }
      end
      association = tab.tab_toggle_associations.build(
        toggle_id: toggle.id,
        toggle_type: 'Category',
        link_type: toggle_params.dig(:route_info, :link_type) || 'DirectLink',
        start_date: toggle_params[:start_date],
        end_date: toggle_params[:end_date],
        regions: toggle_params[:regions]
      )
      if association.save
        association.as_json(include: { linked_toggle: { include: :link_generator } })
      else
        { error: association.errors.full_messages.join(', ') }
      end
    end
  end

  def update
    tab = Tab.find(@params[:tab_id])
    association = tab.tab_toggle_associations.joins(:linked_toggle)
      .where(toggle_type: 'Category', linked_toggles: { id: @params[:id] })
      .includes(linked_toggle: :link_generator)
      .first!
    toggle_params = @params[:toggle]
    ActiveRecord::Base.transaction do
      if association.linked_toggle.update(toggle_params.except(:route_info, :regions, :start_date, :end_date, :toggle_type))
        if toggle_params[:route_info].present?
          association.linked_toggle.route_info = toggle_params[:route_info]
          association.linked_toggle.save!
        end
        association_params = {
          link_type: toggle_params.dig(:route_info, :link_type) || association.link_type,
          start_date: toggle_params[:start_date],
          end_date: toggle_params[:end_date],
          regions: toggle_params[:regions]
        }.compact
        if association.update(association_params)
          association.as_json(include: { linked_toggle: { include: :link_generator } })
        else
          { error: association.errors.full_messages.join(', ') }
        end
      else
        { error: association.linked_toggle.errors.full_messages.join(', ') }
      end
    end
  end

  def destroy
    tab = Tab.find(@params[:tab_id])
    association = tab.tab_toggle_associations.joins(:linked_toggle)
      .where(toggle_type: 'Category', linked_toggles: { id: @params[:id] })
      .includes(linked_toggle: :link_generator)
      .first!
    association.linked_toggle.soft_delete!
    { message: 'Category Toggle soft deleted successfully' }
  end

  def restore
    tab = Tab.find(@params[:tab_id])
    association = tab.tab_toggle_associations.joins(:linked_toggle)
      .where(toggle_type: 'Category', linked_toggles: { id: @params[:id] })
      .includes(linked_toggle: :link_generator)
      .first!
    association.linked_toggle.restore!
    association.as_json(include: { linked_toggle: { include: :link_generator } })
  end

  def reset
    tab = Tab.find(@params[:tab_id])
    association = tab.tab_toggle_associations.joins(:linked_toggle)
      .where(toggle_type: 'Category', linked_toggles: { id: @params[:id] })
      .includes(linked_toggle: :link_generator)
      .first!
    association.linked_toggle.reset_to_default!
    association.as_json(include: { linked_toggle: { include: :link_generator } })
  end
end 