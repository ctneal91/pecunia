FactoryBot.define do
  factory :contribution do
    association :goal
    user { nil }
    amount { 100.00 }
    note { "Monthly contribution" }
    contributed_at { Time.current }

    trait :with_user do
      association :user
    end

    trait :withdrawal do
      amount { -50.00 }
      note { "Emergency withdrawal" }
    end
  end
end
