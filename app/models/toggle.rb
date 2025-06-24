class Toggle < ApplicationRecord
  has_many :tab_toggle_associations, dependent: :destroy
  has_many :tabs, through: :tab_toggle_associations
  
  # Define toggle types as enum - only developers can modify this
  VALID_TOGGLE_TYPES = %w[SHOP CATEGORY].freeze
  
  validates :title, presence: true
  validates :toggle_type, presence: true, inclusion: { in: VALID_TOGGLE_TYPES }
  
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
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

  def reset_to_default!
    update!(
      title: default_title,
      image_url: default_image_url
    )
  end

  def shop?
    toggle_type == 'SHOP'
  end
  
  def category?
    toggle_type == 'CATEGORY'
  end

  def active?
    deleted_at.nil? && start_date.present? && end_date.present? && start_date <= Date.current && end_date >= Date.current
  end

  private

  def default_title
    case toggle_type
    when 'SHOP' then 'Default Shop Toggle'
    when 'CATEGORY' then 'Default Category Toggle'
    else 'Default Toggle'
    end
  end

  def default_image_url
    nil
  end
end