require "rails_helper"

RSpec.describe CategoryAggregator do
  let(:user) { create(:user) }

  describe "#aggregate" do
    context "with no goals" do
      it "returns all goal types with empty stats" do
        aggregator = described_class.new([])
        result = aggregator.aggregate

        expect(result.length).to eq(Goal::GOAL_TYPES.length)
        result.each do |category|
          expect(category[:goal_count]).to eq(0)
          expect(category[:goals]).to eq([])
          expect(category[:total_saved]).to eq(0.0)
          expect(category[:total_target]).to eq(0.0)
          expect(category[:progress]).to eq(0)
        end
      end
    end

    context "with goals of different types" do
      let!(:savings_goal1) { create(:goal, user: user, goal_type: "savings", target_amount: 1000, current_amount: 500) }
      let!(:savings_goal2) { create(:goal, user: user, goal_type: "savings", target_amount: 2000, current_amount: 1000) }
      let!(:vacation_goal) { create(:goal, user: user, goal_type: "vacation", target_amount: 5000, current_amount: 2500) }

      subject { described_class.new([ savings_goal1, savings_goal2, vacation_goal ]) }

      it "groups goals by type" do
        result = subject.aggregate
        savings_category = result.find { |c| c[:goal_type] == "savings" }
        vacation_category = result.find { |c| c[:goal_type] == "vacation" }
        emergency_category = result.find { |c| c[:goal_type] == "emergency_fund" }

        expect(savings_category[:goal_count]).to eq(2)
        expect(vacation_category[:goal_count]).to eq(1)
        expect(emergency_category[:goal_count]).to eq(0)
      end

      it "calculates total saved per category" do
        result = subject.aggregate
        savings_category = result.find { |c| c[:goal_type] == "savings" }

        expect(savings_category[:total_saved]).to eq(1500.0)
      end

      it "calculates total target per category" do
        result = subject.aggregate
        savings_category = result.find { |c| c[:goal_type] == "savings" }

        expect(savings_category[:total_target]).to eq(3000.0)
      end

      it "calculates progress percentage per category" do
        result = subject.aggregate
        savings_category = result.find { |c| c[:goal_type] == "savings" }
        vacation_category = result.find { |c| c[:goal_type] == "vacation" }

        expect(savings_category[:progress]).to eq(50.0)
        expect(vacation_category[:progress]).to eq(50.0)
      end

      it "includes serialized goals in each category" do
        result = subject.aggregate
        savings_category = result.find { |c| c[:goal_type] == "savings" }

        expect(savings_category[:goals].length).to eq(2)
        expect(savings_category[:goals].first).to have_key(:id)
        expect(savings_category[:goals].first).to have_key(:title)
      end
    end

    context "with completed goals" do
      let!(:active_goal) { create(:goal, user: user, goal_type: "savings", target_amount: 1000, current_amount: 500) }
      let!(:completed_goal) { create(:goal, :completed, user: user, goal_type: "savings") }

      subject { described_class.new([ active_goal, completed_goal ]) }

      it "counts completed goals correctly" do
        result = subject.aggregate
        savings_category = result.find { |c| c[:goal_type] == "savings" }

        expect(savings_category[:completed_count]).to eq(1)
        expect(savings_category[:active_count]).to eq(1)
      end
    end

    context "with zero target amount" do
      it "returns 0 progress when total target is zero" do
        aggregator = described_class.new([])
        result = aggregator.aggregate
        empty_category = result.find { |c| c[:goal_type] == "savings" }

        expect(empty_category[:progress]).to eq(0)
      end
    end
  end
end
