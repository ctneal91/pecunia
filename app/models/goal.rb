class Goal < ApplicationRecord
  GOAL_TYPES = %w[emergency_fund savings debt_payoff retirement vacation home education vehicle other].freeze

  belongs_to :user, optional: true
  belongs_to :group, optional: true
  has_many :contributions, dependent: :destroy
  has_many :milestones, dependent: :destroy
  has_many :recurring_contributions, dependent: :destroy

  validates :title, presence: true
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :current_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :goal_type, presence: true, inclusion: { in: GOAL_TYPES }

  def progress_percentage
    return 0 if target_amount.zero?

    ((current_amount / target_amount) * 100).round(1)
  end

  def remaining_amount
    [ target_amount - current_amount, 0 ].max
  end

  def completed?
    current_amount >= target_amount
  end

  def recalculate_current_amount!
    update_column(:current_amount, contributions.sum(:amount))
  end
end
