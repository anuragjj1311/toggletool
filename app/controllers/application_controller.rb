class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  protected

  def render_success(data = {}, message = 'Success')
    respond_to do |format|
      format.json { render json: { success: true, message: message, data: data } }
      format.html { render :index }
    end
  end

  def render_error(message, status = :unprocessable_entity)
    respond_to do |format|
      format.json { render json: { success: false, message: message, errors: message }, status: status }
      format.html { render :index }
    end
  end
end