# config/application.rb

require_relative "boot"
require "rails"  

require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"


Bundler.require(*Rails.groups)

module ToggleTool
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
  end
end
