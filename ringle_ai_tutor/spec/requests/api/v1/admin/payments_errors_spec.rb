require "rails_helper"

RSpec.describe "Admin::Payments mock charge errors", type: :request do
  let!(:user) { create(:user, email: "error@example.com") }
  let!(:plan) { create(:membership_plan, name: "Premium", duration_days: 30, features: %w[study chat]) }

  it "returns 422 if params missing" do
    post "/api/v1/admin/payments/mock_charge", params: {
      email: user.email,
      plan_name: plan.name
    }
    expect(response).to have_http_status(:unprocessable_entity)
    json = JSON.parse(response.body)
    expect(json["success"]).to eq(false)
    expect(json["error"]).to match(/amount_cents/)
  end
end
