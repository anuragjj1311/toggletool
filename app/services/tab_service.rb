class TabService
  def initialize(params)
    @params = params
  end

  def index
    tabs = Tab.includes(tab_toggle_associations: [:linked_toggle, :link_generator]).all
    tabs = tabs.by_region(@params[:region]) if @params[:region].present?
    tabs = tabs.active if @params[:active] == 'true'

    tabs.map do |tab|
      toggles_data = tab.tab_toggle_associations.where(deleted_at: nil).map do |association|
        links = generate_links_for_association(association)
        {
          id: association.linked_toggle.id,
          title: association.linked_toggle.title,
          type: association.toggle_type,
          image_url: association.image_url,
          regions: association.regions,
          link_type: association.link_type,
          links: links,
          deleted_at: association.linked_toggle.deleted_at,
          start_date: association.start_date,
          end_date: association.end_date
        }
      end
      {
        id: tab.id,
        title: tab.title,
        toggles: toggles_data
      }
    end
  end

  private

  def generate_links_for_association(association)
    link_generator = association.link_generator
    return { 'default' => '#' } if link_generator.nil?
    case association.link_type
    when 'DIRECT'
      url = link_generator.url
      url = url['default'] if url.is_a?(Hash) && url['default'].is_a?(String)
      { 'default' => url }
    when 'ACTIVITY'
      url_data = link_generator.url
      if url_data.is_a?(Hash) && url_data['default'].is_a?(String) && url_data.keys.length == 1
        { 'default' => url_data['default'] }
      else
        url_data.is_a?(Hash) ? url_data : { 'default' => url_data }
      end
    else
      { 'default' => '#' }
    end
  end
end 