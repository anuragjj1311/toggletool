class Api::V1::TogglesController < ApplicationController
  before_action :set_toggle, only: [:show, :tabs_for_toggle, :update, :destroy, :restore, :reset]
  before_action :set_tab, except: [:tabs_for_toggle, :available_options]

  def tabs_for_toggle
    Rails.logger.info("Getting all tabs for toggle_id=#{@toggle.id}")
    
    @associations = @toggle.tab_toggle_associations.includes(:tab)
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
    @associations = @tab.tab_toggle_associations.includes(linked_toggle: :link_generator)
    @associations = @associations.active if params[:current] == 'true'
    
    render json: format_associations_response(@associations)
  end

  def show
    Rails.logger.info("Showing toggle for tab_id=#{@tab.id}, toggle_id=#{@toggle.id}")

    @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
    render json: format_association_response(@association)
  end

  def create
    Rails.logger.info("Toggle params: #{toggle_params.inspect}")
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

      # Handle route_info (link_generator) - FIXED
      if toggle_params[:route_info].present?
        link_type_class = toggle_params[:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
        
        if @toggle.link_generator.present?
          # Update existing link generator
          @toggle.link_generator.update!(
            type: link_type_class,
            url: toggle_params[:route_info][:url]
          )
        else
          # Create new link generator
          @toggle.build_link_generator(
            type: link_type_class,
            url: toggle_params[:route_info][:url]
          )
          
          unless @toggle.link_generator.save
            render_error(@toggle.link_generator.errors.full_messages.join(', '))
            return
          end
        end
      end

      # Find or create association to handle duplicates
      @association = @tab.tab_toggle_associations.find_or_initialize_by(
        toggle_id: @toggle.id
      )
      
      # Update association attributes (dates and regions belong here)
      @association.assign_attributes(
        toggle_type: toggle_params[:toggle_type].to_s.upcase,
        link_type: toggle_params.dig(:route_info, :link_type) || 'DIRECT',
        start_date: toggle_params[:start_date],
        end_date: toggle_params[:end_date],
        regions: toggle_params[:regions]
      )

      if @association.save
        status = @association.previously_new_record? ? :created : :ok
        render json: format_association_response(@association), status: status
      else
        render_error(@association.errors.full_messages.join(', '))
      end
    end
  end

  def update
    @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
    
    ActiveRecord::Base.transaction do
      # Update toggle with all attributes including toggle_type
      toggle_attributes = toggle_params.except(:route_info, :regions, :start_date, :end_date)
      if @toggle.update(toggle_attributes)
        # Handle route_info - FIXED
        if toggle_params[:route_info].present?
          if @toggle.link_generator.present?
            @toggle.link_generator.update!(url: toggle_params[:route_info][:url])
          else
            link_type_class = toggle_params[:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
            @toggle.build_link_generator(
              type: link_type_class,
              url: toggle_params[:route_info][:url]
            )
            @toggle.link_generator.save!
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

    # Ensure all tab associations exist for this toggle
    Tab.find_each do |tab|
      association = tab.tab_toggle_associations.find_by(toggle_id: @toggle.id)
      unless association
        # Create association with default values
        tab.tab_toggle_associations.create!(
          toggle_id: @toggle.id,
          toggle_type: @toggle.toggle_type,
          link_type: @toggle.link_generator&.type == 'ActivityLink' ? 'ACTIVITY' : 'DIRECT',
          start_date: tab.start_date,
          end_date: tab.end_date,
          regions: tab.regions || []
        )
      end
    end

    # Get all associations for this toggle
    @associations = @toggle.tab_toggle_associations.includes(:tab)

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
    @association = @tab.tab_toggle_associations.find_by!(linked_toggle: @toggle)
    render_success(format_association_response(@association), 'Toggle reset to default successfully')
  end

  private

  def set_tab
    @tab = Tab.find(params[:tab_id]) if params[:tab_id]
  end

  def set_toggle
    @toggle = Toggle.find(params[:id])
  end

  def generate_links_for_association(association)
    case association.link_type
    when 'DIRECT'
      { 'default' => association.linked_toggle.link_generator&.url }
    when 'ACTIVITY'
      # For activity links, the URL is stored as JSON hash
      url_data = association.linked_toggle.link_generator&.url
      if url_data.is_a?(Hash)
        url_data
      else
        { 'default' => url_data }
      end
    else
      { 'default' => '#' }
    end
  end

  # FIXED: Clean response formatting
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
        image_url: association.linked_toggle.image_url,
        link_generator: association.linked_toggle.link_generator ? {
          type: association.linked_toggle.link_generator.type,
          url: association.linked_toggle.link_generator.url
        } : nil
      }
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