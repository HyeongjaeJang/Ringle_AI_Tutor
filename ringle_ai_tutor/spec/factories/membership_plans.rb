FactoryBot.define do
  factory :membership_plan do
    name { "Premium" }
    duration_days { 60 }
    features { %w[study chat analysis] }
    price_cents { 19900 }
  end
end
