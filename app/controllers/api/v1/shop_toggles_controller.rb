class Api::V1::ShopTogglesController < ApplicationController
  before_action :set_tab
  before_action :set_shop_association, only: [:show, :update, :destroy, :restore, :reset]

  def index
    @shop_associations = @tab.tab_toggle_associations
                            .where(toggle_type: 'Shop')
                            .includes(linked_toggle: :link_generator)

    render json: @shop_associations.as_json(include: { linked_toggle: { include: :link_generator } })
  end

  def create
    params[:toggle][:toggle_type] = 'Shop'
    
    ActiveRecord::Base.transaction do
      @toggle = Toggle.new(toggle_params.except(:route_info, :regions, :start_date, :end_date))
      
      if toggle_params[:route_info].present?
        @toggle.route_info = toggle_params[:route_info]
      end
      
      unless @toggle.save
        render_error(@toggle.errors.full_messages.join(', '))
        return
      end

      @association = @tab.tab_toggle_associations.build(
        toggle_id: @toggle.id,  # Fixed: using toggle_id instead of toggle
        toggle_type: 'Shop',
        link_type: toggle_params.dig(:route_info, :link_type) || 'DirectLink',
        start_date: toggle_params[:start_date],
        end_date: toggle_params[:end_date],
        regions: toggle_params[:regions]
      )

      if @association.save
        render json: @association.as_json(include: { linked_toggle: { include: :link_generator } }), status: :created
      else
        render_error(@association.errors.full_messages.join(', '))
      end
    end
  end

  def update
    ActiveRecord::Base.transaction do
      if @association.linked_toggle.update(toggle_params.except(:route_info, :regions, :start_date, :end_date, :toggle_type))
        if toggle_params[:route_info].present?
          @association.linked_toggle.route_info = toggle_params[:route_info]
          @association.linked_toggle.save!
        end
        
        association_params = {
          link_type: toggle_params.dig(:route_info, :link_type) || @association.link_type,
          start_date: toggle_params[:start_date],
          end_date: toggle_params[:end_date],
          regions: toggle_params[:regions]
        }.compact
        
        if @association.update(association_params)
          render json: @association.as_json(include: { linked_toggle: { include: :link_generator } })
        else
          render_error(@association.errors.full_messages.join(', '))
        end
      else
        render_error(@association.linked_toggle.errors.full_messages.join(', '))
      end
    end
  end

  def show
    render json: @association.as_json(include: { linked_toggle: { include: :link_generator } })
  end

  def destroy
    @association.linked_toggle.soft_delete!
    render_success({}, 'Shop Toggle soft deleted successfully')
  end

  def restore
    @association.linked_toggle.restore!
    render_success(@association.as_json(include: { linked_toggle: { include: :link_generator } }), 'Shop Toggle restored successfully')
  end

  def reset
    @association.linked_toggle.reset_to_default!
    render_success(@association.as_json(include: { linked_toggle: { include: :link_generator } }), 'Shop Toggle reset to default successfully')
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id])
  end

  def set_shop_association
    @association = @tab.tab_toggle_associations.joins(:linked_toggle)
                       .where(toggle_type: 'Shop', linked_toggles: { id: params[:id] })
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
end