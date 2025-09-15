require "rails_helper"

RSpec.describe MembershipPlan, type: :model do
  subject do
    described_class.create!(
      name: "Basic",
      duration_days: 30,
      features: %w[study],
      price_cents: 9900
    )
  end

  it { should validate_presence_of(:name) }
  it { should validate_uniqueness_of(:name) }
  it { should validate_numericality_of(:duration_days).is_greater_than(0) }

  it "allows feature lookups" do
    plan = described_class.new(name: "P", duration_days: 30, features: %w[study chat])
    expect(plan.allows?(:chat)).to be true
    expect(plan.allows?(:analysis)).to be false
  end
end
