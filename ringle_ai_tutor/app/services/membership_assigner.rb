class MembershipAssigner
  def self.call(user:, plan:, assigned_by: "admin")
    starts = Time.current
    ends   = starts + plan.duration_days.days

    UserMembership.create!(
      user: user, membership_plan: plan,
      starts_at: starts, ends_at: ends,
      status: :active, assigned_by: assigned_by
    )
  end
end
