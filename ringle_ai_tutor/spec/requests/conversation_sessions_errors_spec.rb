require "rails_helper"

RSpec.describe "ConversationSessions API errors", type: :request do
  let(:user) { create(:user, email: "nochat@example.com", password: "secret1234") }

  before do
    plan = create(:membership_plan, name: "Basic", features: ["study"], duration_days: 30)
    UserMembership.create!(
      user: user, membership_plan: plan,
      starts_at: Time.current, ends_at: 1.month.from_now, status: :active
    )
  end

  it "blocks chat when plan does not include chat" do
    post "/api/v1/conversation_sessions",
         params:  { email: user.email },
         headers: auth_header_for(user)

    expect(response).to have_http_status(:forbidden)

    body = JSON.parse(response.body) rescue {}
    msg  = body["error"] || body["reason"] || body.dig("data","error") || response.body
    expect(msg).to match(/no_chat_permission|no_chat_coupons/)
  end
end
