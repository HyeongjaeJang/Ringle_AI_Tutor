class Api::V1::MembershipPlansController < ApplicationController
  before_action :set_plan, only: [:show]

  def index
    plans = MembershipPlan.order(:name)
    render_ok(plans.as_json(serializer_options))
  end

  def show
    render_ok(@plan.as_json(serializer_options))
  end

  private

  def set_plan
    @plan = MembershipPlan.find(params[:id])
  end

  def serializer_options
    {
      only: [:id, :name, :duration_days, :price_cents, :features, :created_at, :updated_at]
    }
  end
end
