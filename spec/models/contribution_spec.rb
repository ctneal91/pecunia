require 'rails_helper'

RSpec.describe Contribution, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      contribution = build(:contribution)
      expect(contribution).to be_valid
    end

    it "requires an amount" do
      contribution = build(:contribution, amount: nil)
      expect(contribution).not_to be_valid
    end

    it "requires amount to be non-zero" do
      contribution = build(:contribution, amount: 0)
      expect(contribution).not_to be_valid
    end

    it "allows negative amounts (withdrawals)" do
      contribution = build(:contribution, :withdrawal)
      expect(contribution).to be_valid
    end

    it "requires contributed_at" do
      contribution = build(:contribution, contributed_at: nil)
      expect(contribution).not_to be_valid
    end

    it "does not require a user" do
      contribution = build(:contribution, user: nil)
      expect(contribution).to be_valid
    end
  end

  describe "goal current_amount updates" do
    let(:goal) { create(:goal, current_amount: 0) }

    it "updates goal current_amount after save" do
      create(:contribution, goal: goal, amount: 100)
      expect(goal.reload.current_amount).to eq(100)
    end

    it "updates goal current_amount after destroy" do
      contribution = create(:contribution, goal: goal, amount: 100)
      expect(goal.reload.current_amount).to eq(100)

      contribution.destroy
      expect(goal.reload.current_amount).to eq(0)
    end

    it "sums multiple contributions" do
      create(:contribution, goal: goal, amount: 100)
      create(:contribution, goal: goal, amount: 200)
      create(:contribution, goal: goal, amount: -50)
      expect(goal.reload.current_amount).to eq(250)
    end
  end
end
