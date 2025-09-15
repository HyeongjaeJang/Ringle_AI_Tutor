require "rails_helper"

RSpec.describe Memberships::ExpireJob, type: :job do
  let(:user) { create(:user) }
  let(:plan) { create(:membership_plan, duration_days: 30, features: %w[study chat analysis]) }

  it "expires active memberships whose ends_at is past" do
    past = 1.day.ago
    future = 1.day.from_now

    expired_target = create(:user_membership, user: user, membership_plan: plan,
                          starts_at: past - 29.days, ends_at: past, status: :active)
    still_active   = create(:user_membership, user: user, membership_plan: plan,
                          starts_at: Time.current, ends_at: future, status: :active)

    result = described_class.perform_now
    expect(result).to be >= 1

    expect(expired_target.reload.status).to eq("expired")
    expect(still_active.reload.status).to eq("active")
  end
end
