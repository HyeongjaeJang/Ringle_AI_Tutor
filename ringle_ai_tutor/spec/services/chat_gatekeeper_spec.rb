require "rails_helper"

RSpec.describe ChatGatekeeper do
  let(:user) { create(:user, password: "secret1234") }
  let(:plan_with_chat) { create(:membership_plan, features: ["chat"], duration_days: 30) }

  context "when user has active membership with chat feature" do
    before do
      UserMembership.create!(
        user: user, membership_plan: plan_with_chat,
        starts_at: Time.current, ends_at: 1.month.from_now, status: :active
      )
    end

    it "allows chat without consuming coupons" do
      expect {
        expect(ChatGatekeeper.authorize_and_maybe_redeem!(user: user)).to eq(true)
      }.not_to change { user.coupons.sum(:remaining_uses) }
    end
  end

  context "when user has no chat membership but has a coupon" do
    before do
      user.coupons.create!(kind: "chat", remaining_uses: 1, expires_at: 1.week.from_now)
    end

    it "redeems a coupon and allows chat" do
      expect {
        expect(ChatGatekeeper.authorize_and_maybe_redeem!(user: user)).to eq(true)
      }.to change { user.coupons.first.reload.remaining_uses }.by(-1)
    end
  end

  context "when user has no chat membership and no coupons" do
    it "raises no_chat_permission" do
      expect {
        ChatGatekeeper.authorize_and_maybe_redeem!(user: user)
      }.to raise_error(ChatGatekeeper::Forbidden, "no_chat_permission")
    end
  end
end
