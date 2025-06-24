class Api::V1::TogglesController < ApplicationController
  before_action :set_toggle, only: [:show, :tabs_for_toggle, :update, :destroy, :restore, :reset]
  before_action :set_tab, except: [:tabs_for_toggle, :available_options]

  def tabs_for_toggle
    
    @associations = @toggle.tab_toggle_associations.where(deleted_at: nil).includes(:tab, :link_generator)
    @associations = @associations.active if params[:current] == 'true'
    @associations = @associations.by_region(params[:region]) if params[:region].present?
    
    if @associations.empty?
      render json: { 
        message: "No tabs found for toggle ID #{@toggle.id}",
        toggle: {
          id: @toggle.id,
          title: @toggle.title,
          type: @toggle.toggle_type,
          tabs: []
        }
      }
    else
      tabs_data = @associations.map do |association|
        links = generate_links_for_association(association)
        
        {
          id: association.tab.id,
          title: association.tab.title,
          start_date: association.start_date,
          end_date: association.end_date,
          regions: association.regions,
          link_type: association.link_type,
          links: links
        }
      end
      
      render json: {
        toggle: {
          id: @toggle.id,
          title: @toggle.title,
          type: @toggle.toggle_type,
          tabs: tabs_data
        }
      }
    end
  end

  def available_options
    render json: {
      toggle_types: ['SHOP', 'CATEGORY'],
      link_types: ['DIRECT', 'ACTIVITY'],
      regions: Rails.application.config.regions,
      tab_types: Rails.application.config.tab_types
    }
  end

  def index
    @associations = @tab.tab_toggle_associations.includes(:linked_toggle, :link_generator)
    @associations = @associations.active if params[:current] == 'true'
    
    render json: format_associations_response(@associations)
  end

  def show
    @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
    render json: format_association_response(@association)
  end

  def create
    ActiveRecord::Base.transaction do
      # Create or find toggle - only with toggle-specific attributes
      @toggle = Toggle.find_or_initialize_by(title: toggle_params[:title])
      
      # Only assign toggle-specific attributes (not date/region fields)
      toggle_attributes = toggle_params.slice(:title, :toggle_type, :image_url)
      @toggle.assign_attributes(toggle_attributes)
      
      unless @toggle.save
        render_error(@toggle.errors.full_messages.join(', '))
        return
      end

      # Find or create association to handle duplicates
      @association = @tab.tab_toggle_associations.find_or_initialize_by(
        toggle_id: @toggle.id
      )
      
      # Update association attributes
      association_attributes = {
        toggle_type: toggle_params[:toggle_type].to_s.upcase,
        link_type: toggle_params.dig(:route_info, :link_type) || 'DIRECT',
        start_date: toggle_params[:start_date],
        end_date: toggle_params[:end_date],
        regions: toggle_params[:regions]
      }
      
      # Handle link_generator for the association
      if toggle_params[:route_info].present?
        link_type_class = toggle_params[:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
        link_generator_attributes = {
          type: link_type_class,
          url: toggle_params[:route_info][:url]
        }
        
        if @association.link_generator.present?
          @association.link_generator.update!(link_generator_attributes)
        else
          @association.build_link_generator(link_generator_attributes)
        end
      end

      @association.assign_attributes(association_attributes)

      if @association.save
        status = @association.previously_new_record? ? :created : :ok
        render json: format_association_response(@association), status: status
      else
        render_error(@association.errors.full_messages.join(', '))
      end
    end
  end

  def update
    if @tab
      @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
      ActiveRecord::Base.transaction do
        # Update toggle with all attributes including toggle_type
        toggle_attributes = toggle_params.except(:route_info, :regions, :start_date, :end_date)
        if @toggle.update(toggle_attributes)
          # Handle route_info for the association - FIXED
          if toggle_params[:route_info].present?
            link_generator_attributes = { url: toggle_params[:route_info][:url] }
            if @association.link_generator.present?
              @association.link_generator.update!(link_generator_attributes)
            else
              link_type_class = toggle_params[:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
              @association.build_link_generator(
                type: link_type_class,
                url: toggle_params[:route_info][:url]
              )
              @association.link_generator.save!
            end
          end

          # Update association
          association_params = {
            toggle_type: toggle_params[:toggle_type].to_s.upcase,
            link_type: toggle_params.dig(:route_info, :link_type) || @association.link_type,
            start_date: toggle_params[:start_date],
            end_date: toggle_params[:end_date],
            regions: toggle_params[:regions]
          }.compact

          if @association.update(association_params)
            render json: format_association_response(@association)
          else
            render_error(@association.errors.full_messages.join(', '))
          end
        else
          render_error(@toggle.errors.full_messages.join(', '))
        end
      end
    else
      # Update toggle and all its associations
      update_all_associations
    end
  end

  def destroy
    @toggle.soft_delete!
    render_success({}, 'Toggle soft deleted successfully')
  end

  def restore
    # If tab_id is provided, restore specific association
    if params[:tab_id].present?
      @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
      @toggle.restore!
      render_success(format_association_response(@association), 'Toggle restored successfully')
    else
      # If no tab_id, restore all associations for this toggle
      restore_all_associations
    end
  end

  def restore_all_associations
    @toggle.restore!

    # This logic might need adjustment. When restoring a toggle, we need to decide
    # what URL to give to the newly created/restored associations.
    # For now, we create associations without a link_generator.
    Tab.find_each do |tab|
      association = tab.tab_toggle_associations.with_deleted.find_or_initialize_by(toggle_id: @toggle.id)
      
      if association.new_record?
        # Create association with default values if it doesn't exist
        association.assign_attributes(
          toggle_type: @toggle.toggle_type,
          link_type: 'DIRECT', # Default link_type
          start_date: tab.start_date,
          end_date: tab.end_date,
          regions: tab.regions || []
        )
        association.save!
      else
        # Restore if it was soft-deleted
        association.restore!
      end
    end

    # Get all associations for this toggle
    @associations = @toggle.tab_toggle_associations.where(deleted_at: nil).includes(:tab)

    if @associations.empty?
      render_success(
        { 
          toggle_id: @toggle.id,
          title: @toggle.title,
          restored_tabs: []
        }, 
        'Toggle restored but no tab associations found'
      )
    else
      tabs_data = @associations.map do |association|
        {
          tab_id: association.tab.id,
          tab_title: association.tab.title,
          association_id: association.id
        }
      end
      
      render_success(
        {
          toggle_id: @toggle.id,
          title: @toggle.title,
          restored_tabs: tabs_data
        },
        "Toggle restored successfully for #{@associations.count} tab(s)"
      )
    end
  end

  def reset
    @toggle.reset_to_default!
    # Resetting a toggle might now imply changes to associations.
    # The current implementation just resets toggle's own fields.
    # What should happen to link_generators on associations is undefined.
    # We will leave this as is for now, only resetting title/image_url.
    @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
    render_success(format_association_response(@association), 'Toggle reset to default successfully')
  end

  private

  def update_all_associations
    ActiveRecord::Base.transaction do
      toggle_attributes = toggle_params.slice(:title, :toggle_type, :image_url)
      
      unless @toggle.update(toggle_attributes)
        render_error(@toggle.errors.full_messages.join(', '))
        raise ActiveRecord::Rollback
      end

      # Update all existing associations for this toggle
      @toggle.tab_toggle_associations.find_each do |association|
        association_params = {
          toggle_type: @toggle.toggle_type # Keep association's type consistent with toggle's type
        }.compact
        
        unless association.update(association_params)
          render_error(association.errors.full_messages.join(', '))
          raise ActiveRecord::Rollback
        end
      end
      
      render json: @toggle.as_json(include: :tab_toggle_associations)
    end
  end

  def set_tab
    @tab = Tab.find(params[:tab_id]) if params[:tab_id]
  end

  def set_toggle
    @toggle = Toggle.with_deleted.find(params[:id]) if params[:action] == 'restore'
    @toggle ||= Toggle.find(params[:id])
  end

  def generate_links_for_association(association)
    return { 'default' => '#' } unless association.link_generator

    case association.link_type
    when 'DIRECT'
      { 'default' => association.link_generator&.url }
    when 'ACTIVITY'
      # For activity links, the URL is stored as JSON hash
      url_data = association.link_generator&.url
      if url_data.is_a?(Hash)
        url_data
      else
        { 'default' => url_data }
      end
    else
      { 'default' => '#' }
    end
  end

  def format_association_response(association)
    {
      id: association.id,
      toggle_id: association.toggle_id,
      toggle_title: association.linked_toggle.title,
      tab_title: association.tab.title,
      toggle_type: association.toggle_type,
      link_type: association.link_type,
      start_date: association.start_date,
      end_date: association.end_date,
      regions: association.regions,
      linked_toggle: {
        image_url: association.linked_toggle.image_url
      },
      link_generator: association.link_generator ? {
        type: association.link_generator.type,
        url: association.link_generator.url
      } : nil
    }
  end

  def format_associations_response(associations)
    associations.map { |association| format_association_response(association) }
  end

  def toggle_params
    params.require(:toggle).permit(
      :title,
      :toggle_type,
      :image_url,
      :start_date,
      :end_date,
      regions: [],
      route_info: [:link_type, url: {}] 
    )
  end
end