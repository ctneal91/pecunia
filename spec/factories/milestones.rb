FactoryBot.define do
  factory :milestone do
    association :goal
    percentage { 25 }
    achieved_at { Time.current }

    trait :halfway do
      percentage { 50 }
    end

    trait :almost_there do
      percentage { 75 }
    end

    trait :completed do
      percentage { 100 }
    end
  end
end
