FactoryBot.define do
  factory :group_invite do
    group
    association :invited_by, factory: :user
    sequence(:email) { |n| "invitee#{n}@example.com" }
    status { "pending" }
    accepted_at { nil }
  end
end
