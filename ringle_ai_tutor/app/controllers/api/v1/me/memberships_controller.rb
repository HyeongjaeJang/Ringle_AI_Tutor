class Api::V1::Me::MembershipsController < ApplicationController
  before_action :authenticate_user!

  def current
    user = current_user
    membership = user.current_membership
    
    if membership
      render_ok({
        id: membership.id,
        active: true,
        plan: membership.membership_plan.as_json(only: [:id, :name, :duration_days, :features]),
        ends_at: membership.ends_at
      })
    else
      render_ok({ active: false })
    end
  end
end
