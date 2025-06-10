class Api::V1::CategoryTogglesController < ApplicationController
  before_action :set_tab
  before_action :set_category, only: [:show, :update, :destroy, :restore, :reset]

  def create
    @category = @tab.toggles.build(toggle_params.merge(toggle_type: 'Category'))
    
    if @category.save
      create_association
      render json: @category.as_json(
        include: {
          link_generator: { except: [:linkable_type, :linkable_id] }
        }
      ), status: :created
    else
      render_error(@category.errors.full_messages.join(', '))
    end
  end

  def update
    if @category.update(toggle_params)
      update_association
      render json: @category.as_json(
        include: {
          link_generator: { except: [:linkable_type, :linkable_id] }
        }
      )
    else
      render_error(@category.errors.full_messages.join(', '))
    end
  end

  def show
    render json: @category.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    )
  end

  def destroy
    @category.soft_delete!
    render_success({}, 'Category Toggle soft deleted successfully')
  end

  def restore
    @category.restore!
    render_success(@category.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    ), 'Category Toggle restored successfully')
  end

  def reset
    @category.reset_to_default!
    render_success(@category.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    ), 'Category Toggle reset to default successfully')
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id])
  end

  def set_category
    @category = @tab.toggles.find_by!(id: params[:id], toggle_type: 'Category')
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
      toggle: @category,
      toggle_type: 'Category',
      link_type: @category.link_generator.type,
      start_date: @category.start_date,
      end_date: @category.end_date,
      regions: toggle_params[:regions] || @tab.regions
    }
    
    TabToggleAssociation.create!(association_data)
  end

  def update_association
    association = @tab.tab_toggle_associations.find_by(toggle: @category)
    if association
      association.update!(
        start_date: @category.start_date,
        end_date: @category.end_date,
        regions: toggle_params[:regions] || association.regions
      )
    end
  end
end