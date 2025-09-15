FactoryBot.define do
  factory :user_membership do
    association :user
    association :membership_plan
    starts_at { Time.current }
    ends_at   { 30.days.from_now }
    status    { :active }
  end
end
