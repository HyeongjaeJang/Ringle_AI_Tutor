require "rails_helper"

RSpec.describe "Auth login flow", type: :request do
  let!(:user) { User.create!(email: "login@example.com", name: "Login", password: "secret123") }

  it "logs in and calls protected endpoint" do
    post "/api/v1/auth/login", params: { email: user.email, password: "secret123" }
    expect(response).to have_http_status(:ok)
    token = JSON.parse(response.body).dig("data","token")
    expect(token).to be_present

    get "/api/v1/me/memberships/current",
        headers: { "Authorization" => "Bearer #{token}" }
    expect(response).to have_http_status(:ok)
  end

  it "returns 401 with wrong password" do
    post "/api/v1/auth/login", params: { email: user.email, password: "nope" }
    expect(response).to have_http_status(:unauthorized)
  end
end
