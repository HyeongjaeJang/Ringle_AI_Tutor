require "rails_helper"

RSpec.describe "Me::Memberships & Coupons", type: :request do
  let!(:user) { create(:user, email: "me@example.com") }

  describe "GET /api/v1/me/memberships/current" do
    it "returns current membership info" do
      plan = create(:membership_plan, duration_days: 30, features: %w[study chat], price_cents: 9900)
      MembershipAssigner.call(user: user, plan: plan)

      get "/api/v1/me/memberships/current",
          headers: auth_header_for(user)
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.dig("data", "active")).to eq(true)
      expect(json.dig("data", "plan", "name")).to eq(plan.name)
    end
  end

  describe "GET /api/v1/me/coupons" do
    it "lists coupons" do
      create(:coupon, user: user, kind: "chat", remaining_uses: 3)

      get "/api/v1/me/coupons",
          headers: auth_header_for(user)
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json["data"]).to be_an(Array)
      expect(json["data"].first["kind"]).to eq("chat")
    end
  end
end
