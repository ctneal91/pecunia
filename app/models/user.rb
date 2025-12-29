class User < ApplicationRecord
  has_secure_password

  has_many :goals, dependent: :destroy

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, allow_nil: true

  normalizes :email, with: ->(email) { email.strip.downcase }
end
