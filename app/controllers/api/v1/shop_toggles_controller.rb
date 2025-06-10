class Api::V1::ShopTogglesController < ApplicationController
  before_action :set_tab
  before_action :set_shop, only: [:show, :update, :destroy, :restore, :reset]

  def create
    @shop = @tab.toggles.build(toggle_params.merge(toggle_type: 'Shop'))
    
    if @shop.save
      create_association
      render json: @shop.as_json(
        include: {
          link_generator: { except: [:linkable_type, :linkable_id] }
        }
      ), status: :created
    else
      render_error(@shop.errors.full_messages.join(', '))
    end
  end

  def update
    if @shop.update(toggle_params)
      update_association
      render json: @shop.as_json(
        include: {
          link_generator: { except: [:linkable_type, :linkable_id] }
        }
      )
    else
      render_error(@shop.errors.full_messages.join(', '))
    end
  end

  def show
    render json: @shop.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    )
  end

  def destroy
    @shop.soft_delete!
    render_success({}, 'Shop Toggle soft deleted successfully')
  end

  def restore
    @shop.restore!
    render_success(@shop.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    ), 'Shop Toggle restored successfully')
  end

  def reset
    @shop.reset_to_default!
    render_success(@shop.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    ), 'Shop Toggle reset to default successfully')
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id])
  end

  def set_shop
    @shop = @tab.toggles.find_by!(id: params[:id], toggle_type: 'Shop')
  end

  def toggle_params
    params.require(:toggle).permit(
      :title, :image_url, :landing_url, :start_date, :end_date,
      regions: [],
      route_info: [:url, :type]
    )
  end

  def create_association
    association_data = {
      tab: @tab,
      toggle: @shop,
      toggle_type: 'Shop',
      link_type: @shop.link_generator.type,
      start_date: @shop.start_date,
      end_date: @shop.end_date,
      regions: toggle_params[:regions] || @tab.regions
    }
    
    TabToggleAssociation.create!(association_data)
  end

  def update_association
    association = @tab.tab_toggle_associations.find_by(toggle: @shop)
    if association
      association.update!(
        start_date: @shop.start_date,
        end_date: @shop.end_date,
        regions: toggle_params[:regions] || association.regions
      )
    end
  end
end