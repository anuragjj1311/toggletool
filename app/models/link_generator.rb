class LinkGenerator < ApplicationRecord
  belongs_to :linkable, polymorphic: true
  
  validates :type, presence: true
  validates :url, presence: true
  
  def generate_url
    raise NotImplementedError, 'Subclasses must implement generate_url'
  end

  def link_type
    raise NotImplementedError, 'Subclasses must implement link_type'
  end
end