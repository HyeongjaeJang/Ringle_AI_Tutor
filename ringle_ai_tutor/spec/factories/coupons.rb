FactoryBot.define do
  factory :coupon do
    kind { "chat" }
    remaining_uses { 10 }
    expires_at { 30.days.from_now }
    association :user
  end
end
