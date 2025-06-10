class Api::V1::TogglesController < ApplicationController
  before_action :set_tab
  before_action :set_toggle, only: [:show, :update, :destroy, :restore, :reset]

  def index
    @toggles = @tab.toggles.includes(:link_generator)
    @toggles = @toggles.active if params[:current] == 'true'
    @toggles = @toggles.current if params[:current] == 'true'
    
    render json: @toggles.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    )
  end

  def show
    render json: @toggle.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    )
  end

  def create
    # Create toggle first
    @toggle = @tab.toggles.build(toggle_params.except(:link_generator_attributes))
    
    if @toggle.save
      # Create association
      create_association
      
      render json: @toggle.as_json(
        include: {
          link_generator: { except: [:linkable_type, :linkable_id] }
        }
      ), status: :created
    else
      render_error(@toggle.errors.full_messages.join(', '))
    end
  end

  def update
    # Handle toggle type change
    if toggle_params[:toggle_type].present? && toggle_params[:toggle_type] != @toggle.toggle_type
      @toggle.update_column(:toggle_type, toggle_params[:toggle_type])
      @toggle = @toggle.reload
    end
  
    # Update toggle and its association
    if @toggle.update(toggle_params.except(:link_generator_attributes))
      update_association
      
      render json: @toggle.as_json(
        include: {
          link_generator: { except: [:linkable_type, :linkable_id] }
        }
      )
    else
      render_error(@toggle.errors.full_messages.join(', '))
    end
  end

  def destroy
    @toggle.soft_delete!
    render_success({}, 'Toggle soft deleted successfully')
  end

  def restore
    @toggle.restore!
    render_success(@toggle.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    ), 'Toggle restored successfully')
  end

  def reset
    @toggle.reset_to_default!
    render_success(@toggle.as_json(
      include: {
        link_generator: { except: [:linkable_type, :linkable_id] }
      }
    ), 'Toggle reset to default successfully')
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id])
  end

  def set_toggle
    @toggle = @tab.toggles.find(params[:id])
  end

  def toggle_params
    params.require(:toggle).permit(
      :title,
      :toggle_type,
      :start_date,
      :end_date,
      :image_url,
      :landing_url,
      regions: [],
      link_generator_attributes: [
        :id,
        :type,
        :url,
        url: {} 
      ]
    )
  end

  def create_association
    association_data = {
      tab: @tab,
      toggle: @toggle,
      toggle_type: @toggle.toggle_type,
      link_type: @toggle.link_generator.type,
      start_date: @toggle.start_date,
      end_date: @toggle.end_date,
      regions: toggle_params[:regions] || @tab.regions
    }
    
    TabToggleAssociation.create!(association_data)
  end

  def update_association
    association = @tab.tab_toggle_associations.find_by(toggle: @toggle)
    if association
      association.update!(
        toggle_type: @toggle.toggle_type,
        link_type: @toggle.link_generator.type,
        start_date: @toggle.start_date,
        end_date: @toggle.end_date,
        regions: toggle_params[:regions] || association.regions
      )
    end
  end
end