module Api
  module V1
    class TabsController < ApplicationController
      before_action :set_tab, only: [:show, :update, :destroy]
      before_action :set_toggle, only: [:create]

      def index
        @tabs = Tab.all
        render json: @tabs
      end

      def show
        @associations = @toggle.tab_toggle_associations.includes(:tab)
        render json: {
          tab: @tab,
          associations: @associations
        }
      end

      def create
        @tab = Tab.new(tab_params)
        
        ActiveRecord::Base.transaction do
          if @tab.save
            # Create a new association for this tab and toggle
            @association = TabToggleAssociation.create!(
              tab: @tab,
              linked_toggle: @toggle,
              start_date: @tab.start_date,
              end_date: @tab.end_date,
              toggle_type: @toggle.toggle_type,
              link_type: @toggle.link_generator&.link_type || 'DIRECT'
            )
            
            render json: { 
              message: 'Tab was successfully created',
              tab: @tab,
              association: @association
            }, status: :created
          else
            render json: { errors: @tab.errors }, status: :unprocessable_entity
          end
        end
      end

      def update
        if @tab.update(tab_params)
          render json: { 
            message: 'Tab was successfully updated',
            tab: @tab
          }
        else
          render json: { errors: @tab.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        @tab.destroy
        render json: { message: 'Tab was successfully deleted' }
      end

      private

      def set_tab
        @tab = Tab.find(params[:id])
      end

      def set_toggle
        @toggle = Toggle.find(params[:toggle_id])
      end

      def tab_params
        params.require(:tab).permit(:tab_type, :start_date, :end_date)
      end
    end
  end
end