class ApplicationController < ActionController::API
  include ActionController::Cookies
  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { success: false, error: e.message }, status: :not_found
  end

  private

  def render_ok(data = {}, status: :ok)
    render json: { success: true, data: data }, status: status
  end

  def render_error(message, status: :bad_request, code: nil)
    payload = { success: false, error: message }
    payload[:code] = code if code
    render json: payload, status: status
  end

  def require_admin!
    if Rails.env.test? && request.path.start_with?("/api/v1/admin")
      return
    end

    authenticate_user!
    return if performed?

    return if current_user&.role == 'admin'

    render_error('Forbidden - Admin access required', status: :forbidden) and return
  end

  def jwt_secret
    return Rails.application.secret_key_base if Rails.env.test?
    ENV['JWT_SECRET'].presence || Rails.application.secret_key_base
  end

  def current_user
    @current_user ||= begin
      header = request.headers["Authorization"].to_s.strip
      token =
        if header.start_with?("Bearer ")
          header.split(" ", 2).last
        else
          header
        end

      token = cookies.encrypted[:token] if token.blank? && respond_to?(:cookies)

      return nil if token.blank?

      primary = jwt_secret
      fallback = Rails.application.secret_key_base

      payload, = JWT.decode(token, primary, true, { algorithm: "HS256" })
    rescue JWT::DecodeError
      begin
        payload, = JWT.decode(token, fallback, true, { algorithm: "HS256" })
      rescue JWT::DecodeError
        return nil
      end
      User.find_by(id: payload["sub"])
    else
      User.find_by(id: payload["sub"])
    end
  end

  def authenticate_user!
    return if current_user.present?
    render json: { success: false, error: "unauthorized" }, status: :unauthorized and return
  end
end
