class Api::V1::TabsController < ApplicationController
  def index
    result = TabService.new(params).index
    render json: result
  end

  private

  def generate_links_for_association(association)
    link_generator = association.link_generator
    return { 'default' => '#' } if link_generator.nil?

    case association.link_type
    when 'DIRECT'
      url = link_generator.url
      # If url is a hash, flatten it
      url = url['default'] if url.is_a?(Hash) && url['default'].is_a?(String)
      { 'default' => url }
    when 'ACTIVITY'
      url_data = link_generator.url
      # If url_data is a hash and has a 'default' key that is a string, flatten it
      if url_data.is_a?(Hash) && url_data['default'].is_a?(String) && url_data.keys.length == 1
        { 'default' => url_data['default'] }
      else
        url_data.is_a?(Hash) ? url_data : { 'default' => url_data }
      end
    else
      { 'default' => '#' }
    end
  end

  def tab_params
    params.require(:tab).permit(:start_date, :end_date, regions: [])
  end

  def tab_create_params
    params.require(:tab).permit(:title, :start_date, :end_date, regions: [])
  end

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end
end