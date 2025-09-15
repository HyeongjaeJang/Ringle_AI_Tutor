class Payment < ApplicationRecord
  belongs_to :user
  belongs_to :membership_plan

  enum :status, { pending: 0, succeeded: 1, failed: 2, refunded: 3 }

  validates :amount_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true
  validates :provider, presence: true
  validates :provider_txn_id, presence: true, uniqueness: true
  validates :issued_at, presence: true
end
