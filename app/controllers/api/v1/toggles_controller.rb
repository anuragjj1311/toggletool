module Api
  module V1
    class TogglesController < ApplicationController
      before_action :set_toggle, only: [:show, :update, :destroy]

      def index
        @toggles = Toggle.includes(:tabs, :link_generator).all
        render json: @toggles, include: [:tabs, :link_generator]
      end

      def show
        @associations = @toggle.tab_toggle_associations.includes(:tab)
        render json: {
          toggle: @toggle,
          associations: @associations
        }
      end

      def create
        @toggle = Toggle.new(toggle_params.except(:regions, :start_date, :end_date, :link_type, :route_info, :tab_id))
        @association = TabToggleAssociation.new(association_params)

        ActiveRecord::Base.transaction do
          if @toggle.save
            @association.linked_toggle = @toggle
            
            if params[:toggle][:tab_id].present?
              @association.tab = Tab.find(params[:toggle][:tab_id])
            end
            
            if params[:toggle][:route_info].present?
              link_type_class = params[:toggle][:route_info][:link_type] == 'ACTIVITY' ? 'ActivityLink' : 'DirectLink'
              @toggle.build_link_generator(
                type: link_type_class,
                url: { default: params[:toggle][:route_info][:url] }
              )
              @toggle.link_generator.save!
            end

            if @association.save
              render json: { 
                message: 'Toggle was successfully created',
                toggle: @toggle,
                association: @association
              }, status: :created
            else
              @toggle.destroy
              render json: { errors: @association.errors }, status: :unprocessable_entity
            end
          else
            render json: { errors: @toggle.errors }, status: :unprocessable_entity
          end
        end
      end

      def update
        @association = @toggle.tab_toggle_associations.first || TabToggleAssociation.new

        ActiveRecord::Base.transaction do
          if @toggle.update(toggle_params.except(:regions, :start_date, :end_date, :link_type, :route_info, :tab_id))
            @association.linked_toggle = @toggle

            if params[:toggle][:tab_id].present?
              @association.tab = Tab.find(params[:toggle][:tab_id])
            end

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
              render json: { 
                message: 'Toggle was successfully updated',
                toggle: @toggle,
                association: @association
              }
            else
              render json: { errors: @association.errors }, status: :unprocessable_entity
            end
          else
            render json: { errors: @toggle.errors }, status: :unprocessable_entity
          end
        end
      end

      def destroy
        @toggle.soft_delete!
        render json: { message: 'Toggle was successfully deleted' }
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
  end
end