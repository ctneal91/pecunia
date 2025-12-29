class Goal < ApplicationRecord
  GOAL_TYPES = %w[emergency_fund savings debt_payoff retirement vacation home other].freeze

  belongs_to :user, optional: true
  has_many :contributions, dependent: :destroy

  validates :title, presence: true
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :current_amount, numericality: true
  validates :goal_type, presence: true, inclusion: { in: GOAL_TYPES }

  def progress_percentage
    return 0 if target_amount.zero?

    ((current_amount / target_amount) * 100).round(1)
  end

  def remaining_amount
    [target_amount - current_amount, 0].max
  end

  def completed?
    current_amount >= target_amount
  end

  def recalculate_current_amount!
    update_column(:current_amount, contributions.sum(:amount))
  end
end
