require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with email, name, and password" do
    user = User.new(email: "valid@example.com", name: "Valid", password: "secret1234")
    expect(user).to be_valid
  end

  it "is invalid without email" do
    user = User.new(name: "No Email", password: "secret1234")
    expect(user).not_to be_valid
  end

  it "requires unique email" do
    User.create!(email: "dup@example.com", name: "Dup", password: "secret1234")
    user2 = User.new(email: "dup@example.com", name: "Dup2", password: "secret1234")
    expect(user2).not_to be_valid
  end

  it "can have memberships" do
    user = User.create!(email: "mem@example.com", name: "Member", password: "secret1234")
    plan = create(:membership_plan, duration_days: 30)
    membership = UserMembership.create!(user: user, membership_plan: plan, starts_at: Time.current, ends_at: 1.month.from_now, status: :active)
    expect(user.user_memberships).to include(membership)
  end
end
