class User < ApplicationRecord
  has_secure_password

  has_many :goals, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :groups, through: :memberships
  has_many :created_groups, class_name: "Group", foreign_key: "created_by_id", dependent: :nullify

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, allow_nil: true

  normalizes :email, with: ->(email) { email.strip.downcase }
end
