class TogglesController < ApplicationController
  before_action :set_toggle, only: [:show, :edit, :update, :destroy]

  def index
    @toggles = Toggle.includes(:tabs, :link_generator).all
  end

  def show
    @associations = @toggle.tab_toggle_associations.includes(:tab)
  end

  def new
    @toggle = Toggle.new
    @toggle_types = Toggle::VALID_TOGGLE_TYPES
    @tab_types = Tab::VALID_TAB_TYPES
    @link_types = TabToggleAssociation::VALID_LINK_TYPES
    @regions = Tab::VALID_REGIONS
    @association = TabToggleAssociation.new
    @tabs = Tab.all
  end

  def edit
    @toggle_types = Toggle::VALID_TOGGLE_TYPES
    @tab_types = Tab::VALID_TAB_TYPES
    @link_types = TabToggleAssociation::VALID_LINK_TYPES
    @regions = Tab::VALID_REGIONS
    @association = @toggle.tab_toggle_associations.first || TabToggleAssociation.new
  end

  def create
    @toggle = Toggle.new(toggle_params.except(:regions, :start_date, :end_date, :link_type, :route_info, :tab_id))
    @association = TabToggleAssociation.new(association_params)

    ActiveRecord::Base.transaction do
      if @toggle.save
        @association.linked_toggle = @toggle
        
        # Use the selected tab instead of creating a default one
        if params[:toggle][:tab_id].present?
          @association.tab = Tab.find(params[:toggle][:tab_id])
        end
        
        # Handle link generator
        if params[:toggle][:route_info].present?
          link_type_class = params[:toggle][:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
          @toggle.build_link_generator(
            type: link_type_class,
            url: { default: params[:toggle][:route_info][:url] }
          )
          @toggle.link_generator.save!
        end

        if @association.save
          redirect_to toggles_path, notice: 'Toggle was successfully created.'
        else
          @toggle.destroy
          @toggle_types = Toggle::VALID_TOGGLE_TYPES
          @tab_types = Tab::VALID_TAB_TYPES
          @link_types = TabToggleAssociation::VALID_LINK_TYPES
          @regions = Tab::VALID_REGIONS
          render :new, status: :unprocessable_entity
        end
      else
        @toggle_types = Toggle::VALID_TOGGLE_TYPES
        @tab_types = Tab::VALID_TAB_TYPES
        @link_types = TabToggleAssociation::VALID_LINK_TYPES
        @regions = Tab::VALID_REGIONS
        render :new, status: :unprocessable_entity
      end
    end
  end

  def update
    @association = @toggle.tab_toggle_associations.first || TabToggleAssociation.new

    ActiveRecord::Base.transaction do
      if @toggle.update(toggle_params.except(:regions, :start_date, :end_date, :link_type, :route_info, :tab_id))
        @association.linked_toggle = @toggle

        # Update the tab if changed
        if params[:toggle][:tab_id].present?
          @association.tab = Tab.find(params[:toggle][:tab_id])
        end

        # Handle link generator
        if params[:toggle][:route_info].present?
          link_type_class = params[:toggle][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
          if @toggle.link_generator.present?
            @toggle.link_generator.update!(
              type: link_type_class,
              url: { default: params[:toggle][:route_info][:url] }
            )
          else
            @toggle.build_link_generator(
              type: link_type_class,
              url: { default: params[:toggle][:route_info][:url] }
            )
            @toggle.link_generator.save!
          end
        end

        if @association.update(association_params)
          redirect_to toggles_path, notice: 'Toggle was successfully updated.'
        else
          @toggle_types = Toggle::VALID_TOGGLE_TYPES
          @tab_types = Tab::VALID_TAB_TYPES
          @link_types = TabToggleAssociation::VALID_LINK_TYPES
          @regions = Tab::VALID_REGIONS
          render :edit, status: :unprocessable_entity
        end
      else
        @toggle_types = Toggle::VALID_TOGGLE_TYPES
        @tab_types = Tab::VALID_TAB_TYPES
        @link_types = TabToggleAssociation::VALID_LINK_TYPES
        @regions = Tab::VALID_REGIONS
        render :edit, status: :unprocessable_entity
      end
    end
  end

  def destroy
    @toggle.soft_delete!
    redirect_to toggles_path, notice: 'Toggle was successfully deleted.'
  end

  private

  def set_toggle
    @toggle = Toggle.find(params[:id])
  end

  def toggle_params
    params.require(:toggle).permit(
      :title,
      :toggle_type,
      :image_url,
      :start_date,
      :end_date,
      :link_type,
      :tab_id,
      :regions,
      route_info: [:link_type, :url]
    )
  end

  def association_params
    {
      toggle_type: toggle_params[:toggle_type],
      link_type: params[:toggle][:link_type] || 'DIRECT',
      start_date: toggle_params[:start_date],
      end_date: toggle_params[:end_date],
      regions: params[:toggle][:regions]&.split(',')&.map(&:strip),
      tab_id: params[:toggle][:tab_id]
    }
  end
end 