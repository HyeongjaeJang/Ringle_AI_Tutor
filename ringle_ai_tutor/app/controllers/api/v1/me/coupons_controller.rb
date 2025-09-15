class Api::V1::Me::CouponsController < ApplicationController
  before_action :authenticate_user!

  def index
    coupons = current_user.coupons.order(created_at: :desc)
    render_ok(coupons.map { |c| coupon_json(c) })
  end

  private

  def coupon_json(coupon)
    {
      id: coupon.id,
      kind: coupon.kind,
      remaining_uses: coupon.remaining_uses,
      expires_at: coupon.expires_at,
      created_at: coupon.created_at,
      expired?: coupon.expires_at && coupon.expires_at < Time.current,
      used_up?: coupon.remaining_uses <= 0,
      usable?: coupon.expires_at.nil? || coupon.expires_at >= Time.current && coupon.remaining_uses > 0
    }
  end
end
