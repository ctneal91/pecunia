class Milestone < ApplicationRecord
  PERCENTAGES = [ 25, 50, 75, 100 ].freeze

  belongs_to :goal

  validates :percentage, presence: true, inclusion: { in: PERCENTAGES }
  validates :achieved_at, presence: true
  validates :percentage, uniqueness: { scope: :goal_id }

  scope :ordered, -> { order(percentage: :asc) }
  scope :recent, -> { order(achieved_at: :desc) }
end
