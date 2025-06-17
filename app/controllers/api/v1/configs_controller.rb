class Api::V1::ConfigsController < ApplicationController
  def index
    render json: {
      tab_types: Rails.application.config.tab_types,
      toggle_types: ['SHOP', 'CATEGORY'], # You can move this to config too if needed
      link_types: ['DIRECT', 'ACTIVITY'],
      regions: Rails.application.config.regions
    }
  end
end