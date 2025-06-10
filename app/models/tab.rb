class Tab < ApplicationRecord
  has_many :tab_toggle_associations, dependent: :destroy
  has_many :toggles, through: :tab_toggle_associations

  validates :title, presence: true
  validates :start_date, :end_date, presence: true
  validate :end_date_after_start_date

  # JSON field for regions
  serialize :regions, coder: JSON

  scope :active, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :by_region, ->(region) { 
    where("regions LIKE ?", "%#{region}%")
  }

  def active?
    start_date <= Date.current && end_date >= Date.current
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date
    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end
end