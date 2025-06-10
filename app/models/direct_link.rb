class DirectLink < LinkGenerator
  validates :url, presence: true, format: { with: URI::regexp(%w[http https]) }

  def generate_url
    url
  end

  def link_type
    'direct'
  end

  private

  def url_must_be_string
    errors.add(:url, 'must be a string') unless url.is_a?(String)
  end
end