FactoryBot.define do
  factory :group do
    sequence(:name) { |n| "Group #{n}" }
    association :created_by, factory: :user
  end
end
