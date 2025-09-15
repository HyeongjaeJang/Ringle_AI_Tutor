class Api::V1::PaymentsController < ApplicationController
  before_action :authenticate_user!

  def mock_charge
    p = mock_charge_params
    plan = MembershipPlan.find(p[:plan_id])

    amount_cents    = (p[:amount_cents].presence || plan.price_cents).to_i
    provider_txn_id = p[:provider_txn_id].presence || "mock_#{SecureRandom.hex(8)}"
    metadata        = p[:metadata].presence || {}

    payment = PaymentProcessor.mock_charge!(
      user: current_user,
      plan: plan,
      amount_cents: amount_cents,
      provider_txn_id: provider_txn_id,
      metadata: metadata
    )

    render_ok(payment_response(payment, current_user, plan), status: :created)
  rescue ActiveRecord::RecordNotFound
    render_error("Plan not found: #{params[:plan_id] || params.dig(:payment, :plan_id)}",
                 status: :not_found)
  rescue PaymentProcessor::Error => e
    render_error(e.message, status: :unprocessable_entity)
  end

  private

  def mock_charge_params
    base =
      if params[:plan_id].present?
        params.permit(:plan_id, :amount_cents, :provider_txn_id, :metadata)
      else
        params.require(:payment).permit(:plan_id, :amount_cents, :provider_txn_id, :metadata)
      end
    base.to_h.symbolize_keys
  end

  def payment_response(payment, user, plan)
    {
      payment: {
        id: payment.id,
        status: payment.status,
        amount_cents: payment.amount_cents,
        currency: payment.currency,
        provider: payment.provider,
        provider_txn_id: payment.provider_txn_id,
        issued_at: payment.issued_at
      },
      membership: {
        user_id: user.id,
        plan: plan.name,
        features: plan.features,
        duration_days: plan.duration_days
      }
    }
  end
end
