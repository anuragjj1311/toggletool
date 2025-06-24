class Api::V1::TabsController < ApplicationController
  before_action :set_tab, only: [:show, :update]

  def index
    @tabs = Tab.includes(tab_toggle_associations: { linked_toggle: :link_generator }).all
    @tabs = @tabs.by_region(params[:region]) if params[:region].present?
    @tabs = @tabs.active if params[:active] == 'true'

    result = {}
    
    @tabs.each do |tab|
      toggles_data = tab.tab_toggle_associations.where(deleted_at: nil).includes(linked_toggle: :link_generator).map do |association|
        links = generate_links_for_association(association)
        
        {
          id: association.linked_toggle.id,
          title: association.linked_toggle.title,
          type: association.toggle_type,
          start_date: association.start_date,
          end_date: association.end_date,
          regions: association.regions,
          link_type: association.link_type,
          links: links,
          deleted_at: association.linked_toggle.deleted_at
        }
      end
      
      result[tab.title] = toggles_data
    end

    render json: { all_tabs: result }
  end

  def show
    toggles_data = @tab.tab_toggle_associations.where(deleted_at: nil).includes(linked_toggle: :link_generator).map do |association|
      links = generate_links_for_association(association)
      
      {
        id: association.linked_toggle.id,
        title: association.linked_toggle.title,
        type: association.toggle_type,
        start_date: association.start_date,
        end_date: association.end_date,
        regions: association.regions,
        link_type: association.link_type,
        links: links,
        deleted_at: association.linked_toggle.deleted_at
      }
    end

    render json: {
      tab: {
        id: @tab.id,
        title: @tab.title,
        start_date: @tab.start_date,
        end_date: @tab.end_date,
        regions: @tab.regions,
        toggles: toggles_data
      }
    }
  end

  def update
    if @tab.update(tab_params)
      render json: @tab.as_json(except: [:tab_type])
    else
      render_error(@tab.errors.full_messages.join(', '))
    end
  end

  private

  def set_tab
    @tab = Tab.find(params[:id])
  end

  def generate_links_for_association(association)
        link_generator = association.linked_toggle&.link_generator
    return { 'default' => '#' } if link_generator.nil?

    case association.link_type
    when 'DIRECT'
        { 'default' => link_generator.url }
    when 'ACTIVITY'
        url_data = link_generator.url
        url_data.is_a?(Hash) ? url_data : { 'default' => url_data }
    else
        { 'default' => '#' }
    end
  end

  def tab_params
    params.require(:tab).permit(:start_date, :end_date, regions: [])
  end
end