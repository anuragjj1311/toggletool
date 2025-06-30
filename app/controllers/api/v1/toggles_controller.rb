class Api::V1::TogglesController < ApplicationController
  before_action :set_toggle, only: [:show, :tabs_for_toggle, :update, :destroy, :restore, :reset, :update_association]
  before_action :set_tab, except: [:tabs_for_toggle]

  def tabs_for_toggle
    result = ToggleService.new(params).tabs_for_toggle
    render json: { toggle: result }
  end

  def index
    result = ToggleService.new(params).index
    render json: result
  end

  def show
    result = ToggleService.new(params).show
    render json: result
  end

  def create
    permitted_toggle = toggle_params
    result = ToggleService.new(params.merge(toggle: permitted_toggle)).create
    if result
      render json: result, status: :created
    else
      render_error('Failed to create toggle')
    end
  end

  def update
    permitted_toggle = toggle_params
    result = ToggleService.new(params.merge(toggle: permitted_toggle)).update
    if result
      render json: result
    else
      render_error('Failed to update toggle')
    end
  end

  def destroy
    result = ToggleService.new(params).destroy
    render_success({}, result[:message])
  end

  def restore
    result = ToggleService.new(params).restore
    render_success(result, 'Toggle restored successfully')
  end

  def reset
    result = ToggleService.new(params).reset
    render_success(result, 'Toggle reset to default successfully')
  end

  def associate_tab
    toggle = Toggle.find(params[:id])
    tab = Tab.find(params[:tab_id])
    association = tab.tab_toggle_associations.find_or_initialize_by(toggle_id: toggle.id)
    if association.persisted?
      render_error('Toggle is already associated with this tab')
      return
    end
    
    # Get route_info from params if available
    route_info = params[:route_info] || {}
    link_type = route_info[:link_type] || 'DIRECT'
    
    association.assign_attributes(
      toggle_type: toggle.toggle_type,
      link_type: link_type,
      start_date: tab.start_date,
      end_date: tab.end_date,
      regions: params[:regions] || [],
      image_url: params[:image_url] || route_info[:image_url],
      deleted_at: association.linked_toggle.deleted_at
    )
    
    # Create or update link generator if route_info is provided
    if route_info[:url].present?
      link_type_class = link_type == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
      if association.link_generator.present?
        association.link_generator.update(
          type: link_type_class,
          url: route_info[:url]
        )
      else
        association.build_link_generator(
          type: link_type_class,
          url: route_info[:url]
        )
      end
    end
    
    if association.save
      render json: { success: true, association: association }, status: :created
    else
      render_error(association.errors.full_messages.join(', '))
    end
  end

  def update_association
    association = @tab.tab_toggle_associations.find_by!(toggle_id: @toggle.id)
    permitted = params.require(:association).permit(:start_date, :end_date, :image_url, regions: [], route_info: [:link_type, { url: {} }])
    association.assign_attributes(permitted.except(:route_info))
    if permitted[:route_info].present?
      route_info = permitted[:route_info]
      association.link_type = route_info[:link_type] if route_info[:link_type]

      if route_info[:url].present?
        link_type = route_info[:link_type] || association.link_type
        link_type_class = link_type == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
        
        update_params = { type: link_type_class, url: route_info[:url] }

        if association.link_generator.present?
          association.link_generator.update(update_params)
        else
          association.build_link_generator(update_params)
        end
      end
    end
    if association.save
      render json: { success: true, association: association }
    else
      render json: { error: association.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id]) if params[:tab_id]
  end

  def set_toggle
    if params[:id].present?
      if params[:action] == 'restore'
        # For restore action, find toggle including soft-deleted ones
        @toggle = Toggle.unscoped.find(params[:id])
      else
        @toggle = Toggle.find(params[:id])
      end
    end
  end

  def toggle_params
    params.require(:toggle).permit(
      :title, :image_url, :toggle_type, :start_date, :end_date,
      regions: [],
      route_info: [:link_type, { url: {} }]
    )
  end

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data, message = 'Success')
    render json: { data: data, message: message }
  end
end