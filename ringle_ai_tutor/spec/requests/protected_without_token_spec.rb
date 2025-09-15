require "rails_helper"

RSpec.describe "Protected endpoints w/o token", type: :request do
  it "rejects me/memberships/current without token" do
    get "/api/v1/me/memberships/current"
    expect(response).to have_http_status(:unauthorized)
  end
end
