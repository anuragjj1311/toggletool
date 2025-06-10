class ApplicationController < ActionController::API
  private

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data = {}, message = 'Success')
    render json: { success: true, message: message, data: data }
  end
end