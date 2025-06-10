class Toggle < ApplicationRecord
  has_many :tab_toggle_associations, dependent: :destroy
  has_many :tabs, through: :tab_toggle_associations
  
  has_one :link_generator, as: :linkable, dependent: :destroy
  accepts_nested_attributes_for :link_generator, allow_destroy: true
  
  validates :link_generator, presence: true
  validates :title, presence: true
  validates :start_date, :end_date, presence: true
  validates :toggle_type, presence: true, inclusion: { in: %w[Shop Category] }
  validate :end_date_after_start_date

  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :current, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :shops, -> { where(toggle_type: 'Shop') }
  scope :categories, -> { where(toggle_type: 'Category') }

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
      image_url: default_image_url,
      landing_url: default_landing_url
    )
  end

  def shop?
    toggle_type == 'Shop'
  end
  
  def category?
    toggle_type == 'Category'
  end

  def route_info
    link_generator
  end

  def route_info=(attributes)
    if attributes.is_a?(Hash)
      url_value = attributes[:url] || attributes['url']
      link_type = determine_link_type(url_value)
      attributes[:type] = link_type.classify

      if link_generator.present?
        link_generator.update!(attributes)
      else
        build_link_generator(attributes)
      end
    end
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date
    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end

  def determine_link_type(url)
    case url
    when String then 'direct_link'
    when Hash then 'activity_link'
    else raise ArgumentError, 'URL must be either String or Hash'
    end
  end

  def default_title
    case toggle_type
    when 'Shop' then 'Default Shop Toggle'
    when 'Category' then 'Default Category Toggle'
    else 'Default Toggle'
    end
  end

  def default_image_url
    nil
  end

  def default_landing_url
    nil
  end
end