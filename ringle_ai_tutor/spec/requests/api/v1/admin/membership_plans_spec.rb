require "rails_helper"

RSpec.describe "Admin::MembershipPlans", type: :request do
  describe "GET /api/v1/admin/membership_plans" do
    it "returns ok" do
      get "/api/v1/admin/membership_plans"
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/v1/admin/membership_plans" do
    it "creates a membership plan" do
      post "/api/v1/admin/membership_plans", params: {
        membership_plan: { name: "Silver", duration_days: 30, features: ["study"], price_cents: 9900 }
      }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("Silver")
    end
  end

  describe "PATCH /api/v1/admin/membership_plans/:id" do
    let!(:plan) { MembershipPlan.create!(name: "Bronze", duration_days: 15, features: ["study"], price_cents: 4900) }

    it "updates a plan" do
      patch "/api/v1/admin/membership_plans/#{plan.id}", params: { membership_plan: { price_cents: 5900 } }
      expect(response).to have_http_status(:ok)
      expect(plan.reload.price_cents).to eq(5900)
    end
  end

  describe "DELETE /api/v1/admin/membership_plans/:id" do
    let!(:plan) { MembershipPlan.create!(name: "DeleteMe", duration_days: 15, features: ["study"], price_cents: 4900) }

    it "deletes a plan" do
      expect {
        delete "/api/v1/admin/membership_plans/#{plan.id}"
      }.to change { MembershipPlan.count }.by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end
