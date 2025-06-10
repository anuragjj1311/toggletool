class LinkGenerator < ApplicationRecord
  belongs_to :linkable, polymorphic: true

  validates :type, presence: true, inclusion: { in: %w[DirectLink ActivityLink] }
  validates :url, presence: true

  def generate_url
    raise NotImplementedError, 'Subclasses must implement generate_url method'
  end
  
  def as_json(options = {})
    super(options).merge(
      toggle_type: linkable.try(:toggle_type)
    )
  end

  def direct_link?
    type == 'DirectLink'
  end

  def activity_link?
    type == 'ActivityLink'
  end
end