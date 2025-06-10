class Api::V1::TabsController < ApplicationController
  before_action :set_tab, only: [:show, :update, :destroy]

  def index
    @tabs = Tab.includes(toggles: :link_generator).all
    @tabs = @tabs.by_region(params[:region]) if params[:region].present?
    @tabs = @tabs.active if params[:active] == 'true'

    render json: @tabs.as_json(
      include: {
        toggles: {
          include: {
            link_generator: { except: [:linkable_type, :linkable_id] }
          }
        }
      }
    )
  end

  def show
    render json: @tab.as_json(
      include: {
        toggles: {
          include: {
            link_generator: { except: [:linkable_type, :linkable_id] }
          }
        }
      }
    )
  end

  def create
    @tab = Tab.new(tab_params)
    if @tab.save
      render json: @tab, status: :created
    else
      render_error(@tab.errors.full_messages.join(', '))
    end
  end

  def update
    if @tab.update(tab_params)
      render json: @tab
    else
      render_error(@tab.errors.full_messages.join(', '))
    end
  end

  def destroy
    @tab.destroy
    head :no_content
  end

  private

  def set_tab
    @tab = Tab.find(params[:id])
  end

  def tab_params
    params.require(:tab).permit(:title, :start_date, :end_date, regions: [])
  end
end