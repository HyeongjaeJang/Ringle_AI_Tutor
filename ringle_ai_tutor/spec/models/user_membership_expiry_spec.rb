require "rails_helper"

RSpec.describe "Membership Expiry", type: :model do
  let(:user) { create(:user) }
  let(:plan) { create(:membership_plan, duration_days: 30, features: %w[study chat]) }

  it "marks memberships as expired when ends_at has passed" do
    expired = create(:user_membership, user:, membership_plan: plan,
                                       starts_at: 40.days.ago,
                                       ends_at: 10.days.ago,
                                       status: :active)
    active  = create(:user_membership, user:, membership_plan: plan,
                                       starts_at: 5.days.ago,
                                       ends_at: 20.days.from_now,
                                       status: :active)

    Memberships::ExpireJob.perform_now

    expect(expired.reload.status).to eq("expired")
    expect(active.reload.status).to eq("active")
  end

  it "does not return expired membership from current_membership" do
    expired = create(:user_membership, user:, membership_plan: plan,
                                       starts_at: 40.days.ago,
                                       ends_at: 10.days.ago,
                                       status: :expired)

    expect(user.current_membership).to be_nil
  end
end
