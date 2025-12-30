require 'rails_helper'

RSpec.describe RecurringContribution, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      recurring_contribution = build(:recurring_contribution)
      expect(recurring_contribution).to be_valid
    end

    it "requires an amount" do
      recurring_contribution = build(:recurring_contribution, amount: nil)
      expect(recurring_contribution).not_to be_valid
    end

    it "requires amount to be greater than 0" do
      recurring_contribution = build(:recurring_contribution, amount: 0)
      expect(recurring_contribution).not_to be_valid
    end

    it "requires a frequency" do
      recurring_contribution = build(:recurring_contribution, frequency: nil)
      expect(recurring_contribution).not_to be_valid
    end

    it "requires frequency to be valid" do
      recurring_contribution = build(:recurring_contribution, frequency: "invalid")
      expect(recurring_contribution).not_to be_valid
    end

    it "accepts valid frequencies" do
      %w[daily weekly biweekly monthly].each do |freq|
        recurring_contribution = build(:recurring_contribution, frequency: freq)
        expect(recurring_contribution).to be_valid
      end
    end

    it "requires next_occurrence_at" do
      recurring_contribution = build(:recurring_contribution, next_occurrence_at: nil)
      expect(recurring_contribution).not_to be_valid
    end

    it "requires a goal" do
      recurring_contribution = build(:recurring_contribution, goal: nil)
      expect(recurring_contribution).not_to be_valid
    end

    it "requires a user" do
      recurring_contribution = build(:recurring_contribution, user: nil)
      expect(recurring_contribution).not_to be_valid
    end
  end

  describe "scopes" do
    let!(:active_rc) { create(:recurring_contribution) }
    let!(:inactive_rc) { create(:recurring_contribution, :inactive) }
    let!(:due_rc) { create(:recurring_contribution, :past_due) }
    let!(:future_rc) { create(:recurring_contribution, :future) }

    describe ".active" do
      it "returns only active recurring contributions" do
        expect(RecurringContribution.active).to include(active_rc, due_rc, future_rc)
        expect(RecurringContribution.active).not_to include(inactive_rc)
      end
    end

    describe ".due" do
      it "returns recurring contributions where next_occurrence_at is in the past" do
        expect(RecurringContribution.due).to include(due_rc, active_rc)
        expect(RecurringContribution.due).not_to include(future_rc)
      end
    end
  end

  describe "#calculate_next_occurrence" do
    let(:base_time) { Time.zone.parse("2025-01-15 10:00:00") }

    it "adds 1 day for daily frequency" do
      rc = build(:recurring_contribution, :daily, next_occurrence_at: base_time)
      expect(rc.calculate_next_occurrence).to eq(base_time + 1.day)
    end

    it "adds 1 week for weekly frequency" do
      rc = build(:recurring_contribution, :weekly, next_occurrence_at: base_time)
      expect(rc.calculate_next_occurrence).to eq(base_time + 1.week)
    end

    it "adds 2 weeks for biweekly frequency" do
      rc = build(:recurring_contribution, :biweekly, next_occurrence_at: base_time)
      expect(rc.calculate_next_occurrence).to eq(base_time + 2.weeks)
    end

    it "adds 1 month for monthly frequency" do
      rc = build(:recurring_contribution, :monthly, next_occurrence_at: base_time)
      expect(rc.calculate_next_occurrence).to eq(base_time + 1.month)
    end
  end

  describe "#should_deactivate?" do
    let(:base_time) { Time.zone.parse("2025-01-15 10:00:00") }

    it "returns false when no end_date is set" do
      rc = build(:recurring_contribution, :monthly, next_occurrence_at: base_time, end_date: nil)
      expect(rc.should_deactivate?).to be false
    end

    it "returns false when next occurrence is before end_date" do
      rc = build(:recurring_contribution, :monthly, next_occurrence_at: base_time, end_date: base_time + 2.months)
      expect(rc.should_deactivate?).to be false
    end

    it "returns true when next occurrence would be after end_date" do
      rc = build(:recurring_contribution, :monthly, next_occurrence_at: base_time, end_date: base_time + 15.days)
      expect(rc.should_deactivate?).to be true
    end
  end
end
