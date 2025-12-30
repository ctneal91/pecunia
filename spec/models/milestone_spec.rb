require "rails_helper"

RSpec.describe Milestone, type: :model do
  let(:user) { create(:user) }
  let(:goal) { create(:goal, user: user, target_amount: 1000, current_amount: 0) }

  describe "associations" do
    it { is_expected.to belong_to(:goal) }
  end

  describe "validations" do
    subject { build(:milestone, goal: goal) }

    it { is_expected.to validate_presence_of(:percentage) }
    it { is_expected.to validate_presence_of(:achieved_at) }
    it { is_expected.to validate_inclusion_of(:percentage).in_array(Milestone::PERCENTAGES) }

    it "validates uniqueness of percentage within goal" do
      create(:milestone, goal: goal, percentage: 25)
      duplicate = build(:milestone, goal: goal, percentage: 25)
      expect(duplicate).not_to be_valid
    end

    it "allows same percentage for different goals" do
      other_goal = create(:goal, user: user)
      create(:milestone, goal: goal, percentage: 25)
      other_milestone = build(:milestone, goal: other_goal, percentage: 25)
      expect(other_milestone).to be_valid
    end
  end

  describe "scopes" do
    let!(:milestone_25) { create(:milestone, goal: goal, percentage: 25, achieved_at: 3.days.ago) }
    let!(:milestone_50) { create(:milestone, goal: goal, percentage: 50, achieved_at: 2.days.ago) }
    let!(:milestone_75) { create(:milestone, goal: goal, percentage: 75, achieved_at: 1.day.ago) }

    describe ".ordered" do
      it "orders by percentage ascending" do
        expect(goal.milestones.ordered).to eq([ milestone_25, milestone_50, milestone_75 ])
      end
    end

    describe ".recent" do
      it "orders by achieved_at descending" do
        expect(goal.milestones.recent).to eq([ milestone_75, milestone_50, milestone_25 ])
      end
    end
  end

  describe "PERCENTAGES" do
    it "contains the correct milestone percentages" do
      expect(Milestone::PERCENTAGES).to eq([ 25, 50, 75, 100 ])
    end
  end
end
