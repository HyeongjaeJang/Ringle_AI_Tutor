require "rails_helper"

RSpec.describe Coupon, type: :model do
  let(:user) { create(:user, password: "secret1234") }

  it "is valid with valid attributes" do
    coupon = Coupon.new(user: user, kind: "chat", remaining_uses: 3, expires_at: 1.week.from_now)
    expect(coupon).to be_valid
  end

  it "is invalid without kind" do
    coupon = Coupon.new(user: user, kind: nil, remaining_uses: 1, expires_at: 1.week.from_now)
    expect(coupon).not_to be_valid
  end

  it "decrements remaining_uses when redeemed" do
    coupon = Coupon.create!(user: user, kind: "chat", remaining_uses: 2, expires_at: 1.week.from_now)
    expect { coupon.decrement!(:remaining_uses) }.to change { coupon.reload.remaining_uses }.by(-1)
  end

  it "is expired if expires_at is in the past" do
    coupon = Coupon.create!(user: user, kind: "chat", remaining_uses: 1, expires_at: 1.day.ago)
    expect(coupon.expires_at < Time.current).to eq(true)
  end
end
