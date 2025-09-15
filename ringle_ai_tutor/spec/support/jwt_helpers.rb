module JwtHelpers
  def auth_header_for(user, role: nil, exp: 24.hours.from_now)
    role ||= (user.respond_to?(:role) ? user.role : 'user')
    payload = {
      sub: user.id,
      role: role,
      iat: Time.now.to_i,
      exp: exp.to_i
    }
    secret = Rails.application.secret_key_base
    token  = JWT.encode(payload, secret, 'HS256')
    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include JwtHelpers
end
