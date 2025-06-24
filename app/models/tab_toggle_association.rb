class TabToggleAssociation < ApplicationRecord
  belongs_to :tab
  belongs_to :linked_toggle, class_name: 'Toggle', foreign_key: 'toggle_id'
  has_one :link_generator, as: :linkable, dependent: :destroy
  accepts_nested_attributes_for :link_generator, allow_destroy: true
  
  alias_method :toggle, :linked_toggle

  # Define valid link types as enum
  VALID_LINK_TYPES = %w[DIRECT ACTIVITY].freeze

  validates :toggle_type, presence: true, inclusion: { in: Toggle::VALID_TOGGLE_TYPES }
  validates :link_type, presence: true, inclusion: { in: VALID_LINK_TYPES }
  validates :start_date, :end_date, presence: true
  validate :end_date_after_start_date
  validate :regions_must_be_valid

  # Store regions as JSON array
  serialize :regions, coder: JSON

  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :by_region, ->(region) { 
    where("json_extract(regions, '$') LIKE ?", "%#{region}%")
  }
  scope :shops, -> { where(toggle_type: 'SHOP') }
  scope :categories, -> { where(toggle_type: 'CATEGORY') }

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  def restore!
    update!(deleted_at: nil)
  end

  def deleted?
    deleted_at.present?
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date
    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end

  def regions_must_be_valid
    return unless regions.is_a?(Array)
    invalid_regions = regions - Rails.application.config.regions
    errors.add(:regions, "contains invalid regions: #{invalid_regions.join(', ')}") if invalid_regions.any?
  end
end