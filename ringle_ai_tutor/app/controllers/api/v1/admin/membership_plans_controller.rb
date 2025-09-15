class Api::V1::Admin::MembershipPlansController < ApplicationController
  before_action :require_admin!
  before_action :set_plan, only: [:show, :update, :destroy]

  def index
    plans = MembershipPlan.order(:name)
    render_ok(plans.map { |p| plan_json(p) })
  end

  def show
    render_ok(plan_json(@plan))
  end

  def create
    plan = MembershipPlan.new(plan_params)
    
    if plan.save
      render_ok(plan_json(plan), status: :created)
    else
      render_error(plan.errors.full_messages.join(", "))
    end
  end

  def update
    if @plan.update(plan_params)
      render_ok(plan_json(@plan))
    else
      render_error(@plan.errors.full_messages.join(", "))
    end
  end

  def destroy
    if @plan.destroy
      render_ok({ message: "Membership plan deleted successfully" })
    else
      render_error("Failed to delete membership plan")
    end
  end

  private

  def set_plan
    @plan = MembershipPlan.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error("Membership plan not found", status: :not_found)
  end

  def plan_params
    params.require(:membership_plan).permit(:name, :duration_days, :price_cents, features: [])
  end

  def plan_json(plan)
    {
      id: plan.id,
      name: plan.name,
      duration_days: plan.duration_days,
      price_cents: plan.price_cents,
      features: plan.features,
      created_at: plan.created_at,
      updated_at: plan.updated_at
    }
  end
end
