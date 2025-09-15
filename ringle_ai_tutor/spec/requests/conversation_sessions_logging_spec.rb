require "rails_helper"

RSpec.describe "ConversationSessions logging", type: :request do
  let!(:user) { create(:user, email: "logtest@example.com") }
  let!(:plan) { create(:membership_plan, features: %w[chat], duration_days: 30) }
  let!(:coupon) { create(:coupon, user:, kind: "chat", remaining_uses: 1) }

  before { MembershipAssigner.call(user:, plan:) }

  it "creates, logs turns, and ends a session" do
    post "/api/v1/conversation_sessions", params: { email: user.email }, headers: auth_header_for(user)
    expect(response).to have_http_status(:ok)
    session_id = JSON.parse(response.body)["data"]["session_id"]

    patch "/api/v1/conversation_sessions/#{session_id}", params: { role: "user", content: "Hi" }, headers: auth_header_for(user)
    expect(response).to have_http_status(:ok)
    logs = JSON.parse(response.body)["data"]
    expect(logs["turns"].last["content"]).to eq("Hi")

    post "/api/v1/conversation_sessions/#{session_id}/end_session", headers: auth_header_for(user)
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["data"]["status"]).to eq("ended")
  end
end
