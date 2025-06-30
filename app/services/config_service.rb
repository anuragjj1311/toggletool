class ConfigService
  include Optionable
  def initialize(params)
    @params = params
  end

  def index
    {
      tab_types: Optionable::TAB_TYPES,
      toggle_types: Optionable::TOGGLE_TYPES,
      link_types: Optionable::LINK_TYPES,
      regions: Optionable::REGIONS
    }
  end
end 