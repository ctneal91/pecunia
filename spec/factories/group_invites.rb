FactoryBot.define do
  factory :group_invite do
    group { nil }
    email { "MyString" }
    token { "MyString" }
    invited_by { nil }
    status { "MyString" }
    accepted_at { "2025-12-29 14:24:49" }
  end
end
