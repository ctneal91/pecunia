class RecurringContribution < ApplicationRecord
  FREQUENCIES = %w[daily weekly biweekly monthly].freeze

  belongs_to :goal
  belongs_to :user

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :frequency, presence: true, inclusion: { in: FREQUENCIES }
  validates :next_occurrence_at, presence: true
  validates :is_active, inclusion: { in: [ true, false ] }

  scope :active, -> { where(is_active: true) }
  scope :due, -> { where("next_occurrence_at <= ?", Time.current) }

  def calculate_next_occurrence
    case frequency
    when "daily"
      next_occurrence_at + 1.day
    when "weekly"
      next_occurrence_at + 1.week
    when "biweekly"
      next_occurrence_at + 2.weeks
    when "monthly"
      next_occurrence_at + 1.month
    end
  end

  def should_deactivate?
    end_date.present? && calculate_next_occurrence > end_date
  end
end
