class Contribution < ApplicationRecord
  belongs_to :goal
  belongs_to :user, optional: true

  validates :amount, presence: true, numericality: { other_than: 0 }
  validates :contributed_at, presence: true

  after_save :update_goal_current_amount
  after_destroy :update_goal_current_amount

  default_scope { order(contributed_at: :desc) }

  private

  def update_goal_current_amount
    goal.recalculate_current_amount!
  end
end
