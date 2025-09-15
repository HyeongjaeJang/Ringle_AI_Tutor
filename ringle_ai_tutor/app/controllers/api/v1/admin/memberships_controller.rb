class Api::V1::Admin::MembershipsController < ApplicationController
  before_action :require_admin!
  before_action :set_user

  def create
    plan = MembershipPlan.find_by!(name: params[:plan_name])
    
    membership = MembershipAssigner.call(
      user: @user, 
      plan: plan, 
      assigned_by: "admin"
    )
    
    render_ok(membership_json(membership), status: :created)
  rescue ActiveRecord::RecordNotFound => e
    render_error("Plan not found: #{params[:plan_name]}", status: :not_found)
  rescue ActiveRecord::RecordInvalid => e
    render_error(e.record.errors.full_messages.join(", "))
  end

  def destroy
    membership = @user.user_memberships.find(params[:id])
    
    if membership.update(status: :canceled)
      render_ok(membership_json(membership))
    else
      render_error(membership.errors.full_messages.join(", "))
    end
  rescue ActiveRecord::RecordNotFound
    render_error("Membership not found", status: :not_found)
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  rescue ActiveRecord::RecordNotFound
    render_error("User not found", status: :not_found)
  end

  def membership_json(membership)
    {
      id: membership.id,
      user_id: membership.user_id,
      plan: membership.membership_plan.name,
      status: membership.status,
      starts_at: membership.starts_at,
      ends_at: membership.ends_at,
      assigned_by: membership.assigned_by
    }
  end
end
