class Api::V1::AuthController < ApplicationController
  def signup
    role = determine_user_role
    
    user = User.new(
      email: params[:email],
      name: params[:name],
      password: params[:password],
      role: role
    )
    
    if user.save
      render_ok(user_json(user), status: :created)
    else
      render_error(user.errors.full_messages.join(", "))
    end
  end

  def login
    user = User.find_by(email: params[:email])
    
    unless user&.authenticate(params[:password])
      return render_error("Invalid email or password", status: :unauthorized)
    end
    
    token = generate_jwt_token(user)

    # cookies.encrypted[:token] = {
    #   value: token,
    #   httponly: true,
    #   secure: false,
    #   same_site: :lax,
    #   httponly: true,
    #   path: "/",
    #   expires: 2.weeks.from_now,
    #   domain: "localhost"
    # }

    render_ok({
      token: token,
      user: user_json(user)
    })
  rescue StandardError => e
    Rails.logger.error("[AUTH#login] #{e.class}: #{e.message}")
    Rails.logger.error(e.backtrace.take(10).join("\n"))
    render json: { error: "Authentication failed", detail: e.message }, status: :internal_server_error
  end

  private

  def determine_user_role
    return :user unless params[:admin_code].present?
    
    admin_code = ENV.fetch("ADMIN_REG_CODE", "letmein")
    if ActiveSupport::SecurityUtils.secure_compare(params[:admin_code].to_s, admin_code)
      :admin
    else
      :user
    end
  end

  def generate_jwt_token(user)
    payload = {
      sub: user.id,
      role: user.role,
      iat: Time.current.to_i,
      exp: 24.hours.from_now.to_i
    }
    
    JWT.encode(payload, jwt_secret, 'HS256')
  end

  # def jwt_secret
  #   ENV.fetch('JWT_SECRET', 'devsecret')
  # end

  def user_json(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  end
end
