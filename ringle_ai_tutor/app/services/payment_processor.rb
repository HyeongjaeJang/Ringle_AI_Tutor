class PaymentProcessor
  class Error < StandardError; end

  def self.mock_charge!(user:, plan:, amount_cents:, provider_txn_id:, metadata: {})
    existed = Payment.find_by(provider_txn_id: provider_txn_id)
    return existed if existed&.succeeded?

    ActiveRecord::Base.transaction do
      payment = Payment.create!(
        user: user,
        membership_plan: plan,
        amount_cents: amount_cents,
        currency: "KRW",
        provider: "mock",
        provider_txn_id: provider_txn_id,
        status: :pending,
        metadata: metadata,
        issued_at: Time.current
      )

      MembershipAssigner.call(user: user, plan: plan, assigned_by: "payment")

      payment.update!(status: :succeeded)
      payment
    end
  rescue ActiveRecord::RecordInvalid => e
    raise Error, e.record.errors.full_messages.join(", ")
  end
end
