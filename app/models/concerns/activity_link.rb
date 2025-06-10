class ActivityLink < LinkGenerator
  serialize :url, coder: JSON

  validates :url, presence: true
  validate :url_must_be_hash

  def generate_url
    build_activity_url
  end

  def link_type
    'activity'
  end

  private

  def url_must_be_hash
    errors.add(:url, 'must be a hash') unless url.is_a?(Hash)
  end

  def build_activity_url
    if url['landing_url'].present?
      url['landing_url']
    elsif url['landing_urls'].present?
      determine_appropriate_landing_url(url['landing_urls'])
    else
      build_custom_activity_url
    end
  rescue => e
    Rails.logger.error "Failed to build activity URL: #{e.message}"
    '#'
  end
  
  def determine_appropriate_landing_url(landing_urls)
    landing_urls.values.first 
  end

  def build_custom_activity_url
    '/default-activity-url'
  end
end