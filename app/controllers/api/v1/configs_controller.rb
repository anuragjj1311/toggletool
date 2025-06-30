class Api::V1::ConfigsController < ApplicationController
  def index
    result = ConfigService.new(params).index
    render json: result
  end
end