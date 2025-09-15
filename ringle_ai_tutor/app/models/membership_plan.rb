class MembershipPlan < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :duration_days, numericality: { greater_than: 0 }
  validates :features, presence: true
  def allows?(feature)
    features.include?(feature.to_s)
  end
end
