class ApplicationController < ActionController::API
  protected

  def render_success(data = {}, message = 'Success')
    render json: {
      success: true,
      message: message,
      data: data
    }
  end

  def render_error(message, status = :unprocessable_entity)
    render json: {
      success: false,
      message: message,
      errors: message
    }, status: status
  end
end