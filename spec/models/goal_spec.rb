require 'rails_helper'

RSpec.describe Goal, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      goal = build(:goal)
      expect(goal).to be_valid
    end

    it "requires a title" do
      goal = build(:goal, title: nil)
      expect(goal).not_to be_valid
      expect(goal.errors[:title]).to include("can't be blank")
    end

    it "requires a target_amount" do
      goal = build(:goal, target_amount: nil)
      expect(goal).not_to be_valid
    end

    it "requires target_amount to be greater than 0" do
      goal = build(:goal, target_amount: 0)
      expect(goal).not_to be_valid
    end

    it "requires current_amount to be non-negative" do
      goal = build(:goal, current_amount: -100)
      expect(goal).not_to be_valid
    end

    it "requires a valid goal_type" do
      goal = build(:goal, goal_type: "invalid_type")
      expect(goal).not_to be_valid
    end

    it "accepts valid goal types" do
      Goal::GOAL_TYPES.each do |type|
        goal = build(:goal, goal_type: type)
        expect(goal).to be_valid
      end
    end

    it "does not require a user" do
      goal = build(:goal, user: nil)
      expect(goal).to be_valid
    end
  end

  describe "#progress_percentage" do
    it "returns 0 when no progress" do
      goal = build(:goal, target_amount: 10_000, current_amount: 0)
      expect(goal.progress_percentage).to eq(0)
    end

    it "returns 50 when half complete" do
      goal = build(:goal, :half_complete)
      expect(goal.progress_percentage).to eq(50.0)
    end

    it "returns 100 when complete" do
      goal = build(:goal, :completed)
      expect(goal.progress_percentage).to eq(100.0)
    end
  end

  describe "#remaining_amount" do
    it "returns full target when no progress" do
      goal = build(:goal, target_amount: 10_000, current_amount: 0)
      expect(goal.remaining_amount).to eq(10_000)
    end

    it "returns remaining amount" do
      goal = build(:goal, :half_complete)
      expect(goal.remaining_amount).to eq(5_000)
    end

    it "returns 0 when overfunded" do
      goal = build(:goal, target_amount: 10_000, current_amount: 12_000)
      expect(goal.remaining_amount).to eq(0)
    end
  end

  describe "#completed?" do
    it "returns false when not complete" do
      goal = build(:goal, :half_complete)
      expect(goal.completed?).to be false
    end

    it "returns true when complete" do
      goal = build(:goal, :completed)
      expect(goal.completed?).to be true
    end

    it "returns true when overfunded" do
      goal = build(:goal, target_amount: 10_000, current_amount: 12_000)
      expect(goal.completed?).to be true
    end
  end
end
