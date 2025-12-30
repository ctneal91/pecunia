require "rails_helper"

RSpec.describe RecurringContributionProcessor do
  let(:user) { create(:user) }
  let(:goal) { create(:goal, user: user, target_amount: 1000, current_amount: 0) }

  describe ".process_for_goal" do
    context "with no recurring contributions" do
      it "returns empty results" do
        result = described_class.process_for_goal(goal)
        expect(result[:created]).to be_empty
        expect(result[:milestones]).to be_empty
      end
    end

    context "with active due recurring contribution" do
      let!(:recurring) do
        create(:recurring_contribution,
               goal: goal,
               user: user,
               amount: 100,
               frequency: "monthly",
               next_occurrence_at: 1.day.ago)
      end

      it "creates a contribution" do
        expect { described_class.process_for_goal(goal) }
          .to change(Contribution, :count).by(1)
      end

      it "returns created contribution" do
        result = described_class.process_for_goal(goal)
        expect(result[:created].length).to eq(1)
        expect(result[:created].first.amount).to eq(100)
      end

      it "updates goal current_amount" do
        described_class.process_for_goal(goal)
        expect(goal.reload.current_amount).to eq(100)
      end

      it "advances next_occurrence_at" do
        old_date = recurring.next_occurrence_at
        described_class.process_for_goal(goal)
        expect(recurring.reload.next_occurrence_at).to eq(old_date + 1.month)
      end
    end

    context "with inactive recurring contribution" do
      before do
        create(:recurring_contribution,
               :inactive,
               goal: goal,
               user: user,
               next_occurrence_at: 1.day.ago)
      end

      it "does not create contributions" do
        expect { described_class.process_for_goal(goal) }
          .not_to change(Contribution, :count)
      end
    end

    context "with future recurring contribution" do
      before do
        create(:recurring_contribution,
               goal: goal,
               user: user,
               next_occurrence_at: 1.day.from_now)
      end

      it "does not create contributions" do
        expect { described_class.process_for_goal(goal) }
          .not_to change(Contribution, :count)
      end
    end

    context "with end_date reached" do
      let!(:recurring) do
        create(:recurring_contribution,
               goal: goal,
               user: user,
               frequency: "monthly",
               next_occurrence_at: 1.day.ago,
               end_date: Time.current + 15.days)
      end

      it "creates the contribution" do
        expect { described_class.process_for_goal(goal) }
          .to change(Contribution, :count).by(1)
      end

      it "deactivates the recurring contribution" do
        described_class.process_for_goal(goal)
        expect(recurring.reload.is_active).to be false
      end
    end

    context "with milestones" do
      before do
        create(:recurring_contribution,
               goal: goal,
               user: user,
               amount: 250,
               next_occurrence_at: 1.day.ago)
      end

      it "records milestones" do
        result = described_class.process_for_goal(goal)
        expect(result[:milestones]).to include(25)
      end
    end

    context "with multiple recurring contributions" do
      before do
        create(:recurring_contribution,
               goal: goal,
               user: user,
               amount: 100,
               next_occurrence_at: 1.day.ago)
        create(:recurring_contribution,
               goal: goal,
               user: user,
               amount: 200,
               next_occurrence_at: 2.days.ago)
      end

      it "creates multiple contributions" do
        expect { described_class.process_for_goal(goal) }
          .to change(Contribution, :count).by(2)
      end

      it "updates goal with total amount" do
        described_class.process_for_goal(goal)
        expect(goal.reload.current_amount).to eq(300)
      end
    end
  end

  describe ".process_all" do
    let(:goal2) { create(:goal, user: user, target_amount: 1000, current_amount: 0) }

    before do
      create(:recurring_contribution,
             goal: goal,
             user: user,
             next_occurrence_at: 1.day.ago)
      create(:recurring_contribution,
             goal: goal2,
             user: user,
             next_occurrence_at: 2.days.ago)
    end

    it "processes all due recurring contributions" do
      result = described_class.process_all
      expect(result[:processed]).to eq(2)
      expect(result[:created]).to eq(2)
    end

    it "creates contributions for all goals" do
      described_class.process_all
      expect(Contribution.count).to eq(2)
    end
  end

  describe "#process" do
    let!(:recurring) do
      create(:recurring_contribution,
             goal: goal,
             user: user,
             amount: 100,
             note: "Test note",
             next_occurrence_at: 1.day.ago)
    end

    subject { described_class.new(recurring) }

    it "creates contribution with correct attributes" do
      result = subject.process
      contribution = result[:contribution]

      expect(contribution.goal).to eq(goal)
      expect(contribution.user).to eq(user)
      expect(contribution.amount).to eq(100)
      expect(contribution.note).to eq("Test note")
    end

    it "uses default note when none provided" do
      recurring.update!(note: nil)
      result = subject.process
      expect(result[:contribution].note).to eq("Recurring contribution")
    end

    it "sets contributed_at to original next_occurrence_at" do
      original_occurrence = recurring.next_occurrence_at
      result = subject.process
      expect(result[:contribution].contributed_at).to eq(original_occurrence)
    end
  end
end
