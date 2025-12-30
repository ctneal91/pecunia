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

    context "when goal has no group" do
      let(:goal) { create(:goal, user: user, group: nil, target_amount: 100, current_amount: 50) }

      it "does not include contributors" do
        expect(subject).not_to have_key(:contributors)
        expect(subject).not_to have_key(:contributor_count)
      end
    end

    context "when goal belongs to a group with contributions" do
      let(:user2) { create(:user, name: "Jane Doe", email: "jane@example.com") }
      let(:user3) { create(:user, name: nil, email: "bob@example.com") }
      let(:group_goal) { create(:goal, group: group, user: nil, target_amount: 1000, current_amount: 0) }

      before do
        create(:contribution, goal: group_goal, user: user, amount: 300, contributed_at: 3.days.ago)
        create(:contribution, goal: group_goal, user: user, amount: 200, contributed_at: 2.days.ago)
        create(:contribution, goal: group_goal, user: user2, amount: 400, contributed_at: 1.day.ago)
        create(:contribution, goal: group_goal, user: user3, amount: 100, contributed_at: Time.current)
      end

      subject { described_class.new(group_goal.reload).as_json }

      it "includes contributors array" do
        expect(subject[:contributors]).to be_an(Array)
        expect(subject[:contributors].size).to eq(3)
      end

      it "includes contributor_count" do
        expect(subject[:contributor_count]).to eq(3)
      end

      it "sorts contributors by total amount descending" do
        expect(subject[:contributors].first[:user_name]).to eq(user.name)
        expect(subject[:contributors].first[:total_amount]).to eq(500.0)
      end

      it "includes contributor details" do
        user_contributor = subject[:contributors].find { |c| c[:user_id] == user.id }
        expect(user_contributor[:user_name]).to eq(user.name)
        expect(user_contributor[:total_amount]).to eq(500.0)
        expect(user_contributor[:contribution_count]).to eq(2)
        expect(user_contributor[:percentage]).to eq(50.0)
      end

      it "calculates correct percentages" do
        jane_contributor = subject[:contributors].find { |c| c[:user_id] == user2.id }
        expect(jane_contributor[:percentage]).to eq(40.0)

        bob_contributor = subject[:contributors].find { |c| c[:user_id] == user3.id }
        expect(bob_contributor[:percentage]).to eq(10.0)
      end

      it "uses email when user has no name" do
        bob_contributor = subject[:contributors].find { |c| c[:user_id] == user3.id }
        expect(bob_contributor[:user_name]).to eq("bob@example.com")
      end
    end

    context "when group goal has no contributions" do
      let(:empty_group_goal) { create(:goal, group: group, user: nil, target_amount: 1000, current_amount: 0) }

      subject { described_class.new(empty_group_goal).as_json }

      it "returns empty contributors array" do
        expect(subject[:contributors]).to eq([])
      end

      it "returns zero contributor_count" do
        expect(subject[:contributor_count]).to eq(0)
      end
    end
  end
end
