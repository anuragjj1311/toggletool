class HomeController < ApplicationController
  def index
    @toggles = Toggle.all
  end
end 