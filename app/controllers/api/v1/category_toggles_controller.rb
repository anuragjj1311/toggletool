class Api::V1::CategoryTogglesController < ApplicationController
  before_action :set_tab
  before_action :set_category_association, only: [:show, :update, :destroy, :restore, :reset]

  def index
    result = CategoryToggleService.new(params).index
    render json: result
  end
  
  def create
    result = CategoryToggleService.new(params).create
    if result.is_a?(Hash) && result[:error]
      render_error(result[:error])
    else
      render json: result, status: :created
    end
  end

  def update
    result = CategoryToggleService.new(params).update
    if result.is_a?(Hash) && result[:error]
      render_error(result[:error])
      else
      render json: result
    end
  end

  def show
    result = CategoryToggleService.new(params).show
    render json: result
  end

  def destroy
    result = CategoryToggleService.new(params).destroy
    render_success({}, result[:message])
  end

  def restore
    result = CategoryToggleService.new(params).restore
    render_success(result, 'Category Toggle restored successfully')
  end

  def reset
    result = CategoryToggleService.new(params).reset
    render_success(result, 'Category Toggle reset to default successfully')
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id])
  end

  def set_category_association
    @association = @tab.tab_toggle_associations.joins(:linked_toggle)
                       .where(toggle_type: 'Category', linked_toggles: { id: params[:id] })
                       .includes(linked_toggle: :link_generator)
                       .first!
  end

  def toggle_params
    params.require(:toggle).permit(
      :title, :image_url, :toggle_type, :start_date, :end_date,
      regions: [],
      route_info: [:link_type, :url]
    )
  end

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data, message = 'Success')
    render json: { data: data, message: message }
  end
end