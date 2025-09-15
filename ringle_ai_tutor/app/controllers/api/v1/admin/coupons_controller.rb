class Api::V1::Admin::CouponsController < ApplicationController
  before_action :require_admin!
  before_action :set_user, only: :create

  def create
    coupon = @user.coupons.build(coupon_params)
    
    if coupon.save
      render_ok(coupon_json(coupon), status: :created)
    else
      render_error(coupon.errors.full_messages.join(", "))
    end
  end

  def by_email
    user = User.find_by!(email: params[:email].to_s.strip)
    coupon = user.coupons.build(coupon_params)
    if coupon.save
      render_ok(coupon_json(coupon), status: :created)
    else
      render_error(coupon.errors.full_messages.join(", "))
    end
  rescue ActiveRecord::RecordNotFound
    render_error("User not found", status: :not_found)
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  rescue ActiveRecord::RecordNotFound
    render_error("User not found", status: :not_found)
  end

  
  def coupon_params
    permitted = [:kind, :discount, :remaining_uses, :expires_at]
    if params[:coupon].present?
      params.require(:coupon).permit(*permitted)
    else
      params.permit(*permitted)
    end
  end


  def coupon_json(coupon)
    {
      id: coupon.id,
      kind: coupon.kind,
      remaining_uses: coupon.remaining_uses,
      expires_at: coupon.expires_at,
      user_id: coupon.user_id,
      created_at: coupon.created_at
    }
  end
end
