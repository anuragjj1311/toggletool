class DirectLink < LinkGenerator
  serialize :url, coder: JSON

  validates :url, presence: true
  validate :url_must_have_default

  def generate_url
    # For direct links, return the URL hash which should contain a 'default' key
    url
  end

  def link_type
    'DIRECT'
  end

  private

  def url_must_have_default
    if url.is_a?(Hash)
      errors.add(:url, 'must contain a default key') unless url.key?('default')
    else
      errors.add(:url, 'must be a hash with default key')
    end
  end
end