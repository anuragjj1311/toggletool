class TabsController < ApplicationController
  before_action :set_tab, only: [:show, :edit, :update, :destroy]
  before_action :set_toggle, only: [:new, :create]

  def index
    @tabs = Tab.all
  end

  def show
     @associations = @toggle.tab_toggle_associations.includes(:tab)
  end

  def new
    @tab = Tab.new
  end

  def edit
    @tab = Tab.find(params[:id])
  end

  def create
    @tab = Tab.new(tab_params)
    
    ActiveRecord::Base.transaction do
      if @tab.save
        # Create a new association for this tab and toggle
        TabToggleAssociation.create!(
          tab: @tab,
          linked_toggle: @toggle,
          start_date: @tab.start_date,
          end_date: @tab.end_date,
          toggle_type: @toggle.toggle_type,
          link_type: @toggle.link_generator&.link_type || 'DIRECT'
        )
        
        respond_to do |format|
          format.html { redirect_to @toggle }
          format.json { render json: { message: 'Tab was successfully created', tab: @tab }, status: :created }
        end
      else
        respond_to do |format|
          format.html { render :new }
          format.json { render json: { errors: @tab.errors }, status: :unprocessable_entity }
        end
      end
    end
  end

  def update
    @tab = Tab.find(params[:id])
    if @tab.update(tab_params)
      respond_to do |format|
        format.html { redirect_to @tab }
        format.json { render json: { message: 'Tab was successfully updated', tab: @tab } }
      end
    else
      respond_to do |format|
        format.html { render :edit }
        format.json { render json: { errors: @tab.errors }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @tab = Tab.find(params[:id])
    @tab.destroy
    respond_to do |format|
      format.html { redirect_to tabs_url }
      format.json { render json: { message: 'Tab was successfully destroyed' } }
    end
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