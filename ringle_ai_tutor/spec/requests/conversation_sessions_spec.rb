require "rails_helper"

RSpec.describe "ConversationSessions", type: :request do
  let(:user) { create(:user, email: "chatuser@example.com", password: "secret1234") }

  before do
    plan = create(:membership_plan, name: "Premium", features: ["chat"], duration_days: 30)
    UserMembership.create!(
      user: user, membership_plan: plan,
      starts_at: Time.current, ends_at: 1.month.from_now, status: :active
    )
  end

  it "creates a conversation session with chat membership (no coupon needed)" do
    post "/api/v1/conversation_sessions",
         params:  { email: user.email },
         headers: auth_header_for(user)
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body.dig("data","allowed")).to eq(true)
    expect(body.dig("data","session_id")).to be_present
  end
end
