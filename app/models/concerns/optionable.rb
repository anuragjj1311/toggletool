# frozen_string_literal: true

module Optionable
  extend ActiveSupport::Concern

  TAB_TYPES = %w[
    Men
    Women
    Kids
    Boys
    Girls
  ].freeze

  REGIONS = %w[
    Haryana
    Punjab
    Rajasthan
    Delhi
    Mumbai
    Bangalore
    Chennai
    Kolkata
    Hyderabad
    Bihar
    Gujarat
    UttarPradesh
    MadhyaPradesh
    WestBengal
    Kerala
    Assam
    Odisha
    Uttarakhand
    Jharkhand
    Chhattisgarh
    Telangana
    AndhraPradesh
  ].freeze

  TOGGLE_TYPES = %w[
    SHOP
    CATEGORY
  ].freeze

  LINK_TYPES = %w[
    DIRECT
    ACTIVITY
  ].freeze
end 