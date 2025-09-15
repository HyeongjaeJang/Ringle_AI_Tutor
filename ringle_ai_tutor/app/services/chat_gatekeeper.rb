class ChatGatekeeper
  class Forbidden < StandardError; end

  def self.authorize_and_maybe_redeem!(user:)
    membership = user.current_membership

    return true if membership&.membership_plan&.name&.include?("Premium")

    coupon = user.coupons
                 .where(kind: %w[chat free_trial])
                 .where("remaining_uses > 0")
                 .where("expires_at IS NULL OR expires_at > ?", Time.current)
                 .first
    if coupon
      coupon.decrement!(:remaining_uses)
      return true
    end

    raise Forbidden, "no_chat_permission"
  end
end
