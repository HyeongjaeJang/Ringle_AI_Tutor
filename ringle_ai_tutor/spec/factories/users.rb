FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    name { "Tester" }
    password {"secret1234"}
  end
end
