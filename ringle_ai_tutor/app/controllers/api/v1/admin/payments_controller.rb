class Api::V1::Admin::PaymentsController < ApplicationController
  before_action :require_admin!

  def mock_charge
    user = User.find_by!(email: params[:email])
    plan = MembershipPlan.find_by!(name: params[:plan_name])
    
    return unless validate_payment_params!
    
    payment = PaymentProcessor.mock_charge!(
      user: user,
      plan: plan,
      amount_cents: params[:amount_cents].to_i,
      provider_txn_id: params[:provider_txn_id].to_s,
      metadata: params[:metadata].presence || {}
    )
    
    render_ok(payment_response(payment, user, plan))
  rescue ActiveRecord::RecordNotFound => e
    if e.model == 'User'
      render_error("User not found: #{params[:email]}", status: :not_found)
    elsif e.model == 'MembershipPlan'
      render_error("Plan not found: #{params[:plan_name]}", status: :not_found)
    else
      render_error("Record not found", status: :not_found)
    end
  rescue PaymentProcessor::Error => e
    render_error(e.message, status: :unprocessable_content)
  end

  private

  def validate_payment_params!
    required_params = %w[amount_cents provider_txn_id email plan_name]
    missing_params = required_params.select { |param| params[param].blank? }
    
    if missing_params.any?
      render_error("Missing required parameters: #{missing_params.join(', ')}", status: :unprocessable_content)
      return false
    end
    true
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
        user_email: user.email,
        plan: plan.name,
        features: plan.features,
        duration_days: plan.duration_days
      }
    }
  end
end
