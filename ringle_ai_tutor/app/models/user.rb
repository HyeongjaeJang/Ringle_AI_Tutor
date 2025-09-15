class User < ApplicationRecord
  enum :role, { user: 0, admin: 1 }

  has_secure_password

  validates :email, presence: true, uniqueness: true

  has_many :user_memberships, dependent: :destroy
  has_many :coupons, dependent: :destroy

  def current_membership
    user_memberships.active
                    .currently_valid
                    .order(ends_at: :desc)
                    .first
  end
end
