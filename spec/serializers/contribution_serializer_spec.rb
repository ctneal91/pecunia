require "rails_helper"

RSpec.describe ContributionSerializer do
  describe "#as_json" do
    let(:user) { create(:user) }
    let(:goal) { create(:goal, user: user) }
    let(:contribution) do
      create(:contribution,
        goal: goal,
        user: user,
        amount: 150.50,
        note: "Monthly savings",
        contributed_at: Date.new(2025, 1, 15)
      )
    end

    subject { described_class.new(contribution).as_json }

    it "returns contribution id" do
      expect(subject[:id]).to eq(contribution.id)
    end

    it "returns goal_id" do
      expect(subject[:goal_id]).to eq(goal.id)
    end

    it "returns user_id" do
      expect(subject[:user_id]).to eq(user.id)
    end

    it "returns amount as float" do
      expect(subject[:amount]).to eq(150.50)
    end

    it "returns note" do
      expect(subject[:note]).to eq("Monthly savings")
    end

    it "returns contributed_at" do
      expect(subject[:contributed_at]).to eq(Date.new(2025, 1, 15))
    end

    it "returns created_at" do
      expect(subject[:created_at]).to be_present
    end
  end
end
