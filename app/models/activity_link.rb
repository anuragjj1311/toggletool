class ActivityLink < LinkGenerator
  serialize :url, coder: JSON

  validates :url, presence: true
  validate :url_must_be_hash

  def generate_url
    build_activity_url
  end

  def link_type
    'ACTIVITY'
  end

  private

  def url_must_be_hash
    errors.add(:url, 'must be a hash') unless url.is_a?(Hash)
  end

  def build_activity_url
    # Return the entire hash of URLs for ACTIVITY links
    # This allows the frontend to choose the appropriate URL based on context
    url
  rescue => e
    Rails.logger.error "Failed to build activity URL: #{e.message}"
    { 'default' => '#' }
  end
end