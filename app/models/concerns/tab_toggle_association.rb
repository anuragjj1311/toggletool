class TabToggleAssociation < ApplicationRecord
  belongs_to :tab
  belongs_to :toggle

  validates :tab_id, :toggle_id, presence: true
  validates :toggle_type, presence: true, inclusion: { in: %w[Shop Category] }
  validates :link_type, presence: true, inclusion: { in: %w[DirectLink ActivityLink] }
  validates :start_date, :end_date, presence: true
  validate :end_date_after_start_date
  validate :toggle_type_matches_toggle

  # JSON field for regions
  serialize :regions, coder: JSON

  scope :active, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :by_toggle_type, ->(type) { where(toggle_type: type) }
  scope :by_link_type, ->(type) { where(link_type: type) }
  scope :by_region, ->(region) { 
    where("JSON_EXTRACT(regions, '$[*]') LIKE ?", "%#{region}%")
  }

  def active?
    start_date <= Date.current && end_date >= Date.current
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date
    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end

  def toggle_type_matches_toggle
    return unless toggle && toggle_type
    errors.add(:toggle_type, 'must match the toggle type') if toggle_type != toggle.toggle_type
  end
end