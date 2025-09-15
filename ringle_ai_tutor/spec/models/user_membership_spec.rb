require "rails_helper"

RSpec.describe UserMembership, type: :model do
  let(:user) { create(:user) }
  let(:plan) { create(:membership_plan, duration_days: 30, features: ["chat"]) }

  it "is valid with valid attributes" do
    membership = described_class.new(
      user: user,
      membership_plan: plan,
      starts_at: Time.current,
      ends_at: 1.month.from_now,
      status: :active
    )
    expect(membership).to be_valid
  end

  it "is invalid without a user" do
    membership = described_class.new(
      user: nil,
      membership_plan: plan,
      starts_at: Time.current,
      ends_at: 1.month.from_now,
      status: :active
    )
    expect(membership).not_to be_valid
    expect(membership.errors[:user]).to be_present
  end

  it "is invalid without a plan" do
    membership = described_class.new(
      user: user,
      membership_plan: nil,
      starts_at: Time.current,
      ends_at: 1.month.from_now,
      status: :active
    )
    expect(membership).not_to be_valid
    expect(membership.errors[:membership_plan]).to be_present
  end

  it "marks expired when ends_at is past" do
    membership = UserMembership.create!(
      user: user,
      membership_plan: plan,
      starts_at: Time.current,
      ends_at: 1.day.ago,
      status: :active
    )

    UserMembership.expire_overdue!

    expect(membership.reload.status).to eq("expired")
  end
end
