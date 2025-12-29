class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :group

  validates :role, presence: true, inclusion: { in: Group::ROLES }
  validates :user_id, uniqueness: { scope: :group_id, message: "is already a member of this group" }

  scope :admins, -> { where(role: "admin") }
  scope :members, -> { where(role: "member") }

  def admin?
    role == "admin"
  end
end
