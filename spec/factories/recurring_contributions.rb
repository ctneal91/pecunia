FactoryBot.define do
  factory :recurring_contribution do
    association :goal
    association :user
    amount { 100.00 }
    frequency { "monthly" }
    next_occurrence_at { Time.current }
    is_active { true }
    note { nil }

    trait :daily do
      frequency { "daily" }
    end

    trait :weekly do
      frequency { "weekly" }
    end

    trait :biweekly do
      frequency { "biweekly" }
    end

    trait :monthly do
      frequency { "monthly" }
    end

    trait :with_end_date do
      end_date { 6.months.from_now }
    end

    trait :inactive do
      is_active { false }
    end

    trait :past_due do
      next_occurrence_at { 1.day.ago }
    end

    trait :future do
      next_occurrence_at { 1.week.from_now }
    end
  end
end
