require "rails_helper"

RSpec.describe "Admin::Payments mock charge", type: :request do
  let!(:user) { create(:user, email: "test@example.com") }
  let!(:plan) { create(:membership_plan, name: "Premium", duration_days: 60, features: %w[study chat analysis], price_cents: 19900) }

  it "creates a succeeded payment and assigns membership" do
    post "/api/v1/admin/payments/mock_charge", params: {
      email: user.email,
      plan_name: plan.name,
      amount_cents: 19900,
      provider_txn_id: "txn_1"
    }

    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)
    expect(json["success"]).to eq(true)
    expect(json["data"]["payment"]["status"]).to eq("succeeded")
    expect(user.user_memberships.active.count).to be >= 1
  end

  it "is idempotent for same provider_txn_id" do
    2.times do
      post "/api/v1/admin/payments/mock_charge", params: {
        email: user.email,
        plan_name: plan.name,
        amount_cents: 19900,
        provider_txn_id: "txn_same"
      }
    end
    expect(Payment.where(provider_txn_id: "txn_same").count).to eq(1)
    expect(user.user_memberships.count).to eq(1)
  end

  it "returns 422 when required params missing" do
    post "/api/v1/admin/payments/mock_charge", params: { email: user.email, plan_name: plan.name }
    expect(response.status).to eq(422) # Rack 3 경고 회피용 숫자 비교
  end
end
