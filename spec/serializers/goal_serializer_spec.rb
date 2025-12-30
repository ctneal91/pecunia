require "rails_helper"

RSpec.describe GoalSerializer do
  describe "#as_json" do
    let(:user) { create(:user) }
    let(:group) { create(:group, name: "Family", created_by: user) }
    let(:goal) do
      create(:goal,
        user: user,
        title: "Vacation Fund",
        description: "Save for beach trip",
        target_amount: 1000,
        current_amount: 250,
        goal_type: "savings",
        target_date: Date.new(2025, 6, 1),
        icon: "beach",
        color: "#3498db",
        group: group
      )
    end

    subject { described_class.new(goal).as_json }

    it "returns goal id" do
      expect(subject[:id]).to eq(goal.id)
    end

    it "returns goal title" do
      expect(subject[:title]).to eq("Vacation Fund")
    end

    it "returns goal description" do
      expect(subject[:description]).to eq("Save for beach trip")
    end

    it "returns target_amount as float" do
      expect(subject[:target_amount]).to eq(1000.0)
    end

    it "returns current_amount as float" do
      expect(subject[:current_amount]).to eq(250.0)
    end

    it "returns goal_type" do
      expect(subject[:goal_type]).to eq("savings")
    end

    it "returns target_date" do
      expect(subject[:target_date]).to eq(Date.new(2025, 6, 1))
    end

    it "returns icon" do
      expect(subject[:icon]).to eq("beach")
    end

    it "returns color" do
      expect(subject[:color]).to eq("#3498db")
    end

    it "returns progress_percentage" do
      expect(subject[:progress_percentage]).to eq(25.0)
    end

    it "returns remaining_amount as float" do
      expect(subject[:remaining_amount]).to eq(750.0)
    end

    it "returns completed status" do
      expect(subject[:completed]).to be false
    end

    it "returns group_id" do
      expect(subject[:group_id]).to eq(group.id)
    end

    it "returns group_name" do
      expect(subject[:group_name]).to eq("Family")
    end

    it "returns timestamps" do
      expect(subject[:created_at]).to be_present
      expect(subject[:updated_at]).to be_present
    end

    context "when goal has no group" do
      let(:goal) { create(:goal, user: user, group: nil) }

      it "returns nil for group_id and group_name" do
        expect(subject[:group_id]).to be_nil
        expect(subject[:group_name]).to be_nil
      end
    end

    context "when goal is completed" do
      let(:goal) { create(:goal, user: user, target_amount: 100, current_amount: 100) }

      it "returns completed as true" do
        expect(subject[:completed]).to be true
      end
    end
  end
end
