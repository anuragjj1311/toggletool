class Tab < ApplicationRecord
  include Optionable
  has_many :tab_toggle_associations, dependent: :destroy
  has_many :toggles, through: :tab_toggle_associations

  validates :title, presence: true, inclusion: { in: Optionable::TAB_TYPES }
  validates :start_date, :end_date, presence: true
  validate :end_date_after_start_date

  serialize :regions, coder: JSON
  validate :regions_must_be_valid

  scope :active, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :by_region, ->(region) { 
    where("json_extract(regions, '$') LIKE ?", "%#{region}%")
  }

  before_destroy :prevent_predefined_tab_deletion

  private

  def end_date_after_start_date
    return unless start_date && end_date
    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end

  def regions_must_be_valid
    return unless regions.is_a?(Array)
    invalid_regions = regions - Optionable::REGIONS
    errors.add(:regions, "contains invalid regions: #{invalid_regions.join(', ')}") if invalid_regions.any?
  end

  def prevent_predefined_tab_deletion
    if Optionable::TAB_TYPES.include?(title)
      errors.add(:base, "Cannot delete predefined tab: #{title}")
      throw(:abort)
    end
  end
end