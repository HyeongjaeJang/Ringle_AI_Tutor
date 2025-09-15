class Coupon < ApplicationRecord
  belongs_to :user
  validates :kind, presence: true
  validates :remaining_uses, numericality: { greater_than_or_equal_to: 0 }

  scope :usable, -> { where("expires_at IS NULL OR expires_at >= ?", Time.current)
                        .where("remaining_uses > 0") }

  def redeem!(count = 1)
    raise StandardError, "insufficient_uses" if remaining_uses < count
    decrement!(:remaining_uses, count)
  end
end
