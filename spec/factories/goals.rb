FactoryBot.define do
  factory :goal do
    user { nil }
    title { "Emergency Fund" }
    description { "Save for unexpected expenses" }
    target_amount { 10_000.00 }
    current_amount { 0.00 }
    goal_type { "emergency_fund" }
    target_date { 1.year.from_now.to_date }
    icon { "shield" }
    color { "#4CAF50" }

    trait :with_user do
      association :user
    end

    trait :half_complete do
      current_amount { 5_000.00 }
    end

    trait :completed do
      current_amount { 10_000.00 }
    end
  end
end
