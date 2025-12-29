class GroupInvite < ApplicationRecord
  STATUSES = %w[pending accepted declined expired].freeze

  belongs_to :group
  belongs_to :invited_by, class_name: "User"

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :token, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :email, uniqueness: { scope: :group_id, message: "has already been invited to this group" }

  before_validation :generate_token, on: :create
  before_validation :normalize_email

  scope :pending, -> { where(status: "pending") }

  def pending?
    status == "pending"
  end

  def accept!(user)
    return false unless pending?
    return false if group.member?(user)

    transaction do
      group.memberships.create!(user: user, role: "member")
      update!(status: "accepted", accepted_at: Time.current)
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def decline!
    return false unless pending?

    update!(status: "declined")
  end

  def expired?
    created_at < 7.days.ago
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def normalize_email
    self.email = email&.strip&.downcase
  end
end
