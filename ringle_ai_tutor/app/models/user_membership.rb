class UserMembership < ApplicationRecord
  belongs_to :user
  belongs_to :membership_plan

  enum :status, { active: 0, canceled: 1, expired: 2 }

  validates :starts_at, :ends_at, presence: true

  before_validation :set_default_starts_at, on: :create

  scope :currently_valid, -> { where("ends_at > ?", Time.current) }
  scope :overdue,         -> { where("ends_at <= ?", Time.current) }

  def self.expire_overdue!
    total_overdue = overdue.count
    overdue.where.not(status: :expired)
           .update_all(status: UserMembership.statuses[:expired], updated_at: Time.current)
    total_overdue
  end

  private

  def set_default_starts_at
    self.starts_at ||= Time.current if membership_plan_id.present?
  end
end
