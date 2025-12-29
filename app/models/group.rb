class Group < ApplicationRecord
  ROLES = %w[admin member].freeze

  belongs_to :created_by, class_name: "User"
  has_many :memberships, dependent: :destroy
  has_many :members, through: :memberships, source: :user
  has_many :goals, dependent: :nullify

  validates :name, presence: true
  validates :invite_code, presence: true, uniqueness: true

  before_validation :generate_invite_code, on: :create
  after_create :add_creator_as_admin

  def regenerate_invite_code!
    update!(invite_code: SecureRandom.urlsafe_base64(8))
  end

  def admin?(user)
    memberships.exists?(user: user, role: "admin")
  end

  def member?(user)
    memberships.exists?(user: user)
  end

  private

  def generate_invite_code
    self.invite_code ||= SecureRandom.urlsafe_base64(8)
  end

  def add_creator_as_admin
    memberships.create!(user: created_by, role: "admin")
  end
end
