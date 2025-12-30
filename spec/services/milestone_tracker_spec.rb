require "rails_helper"

RSpec.describe MilestoneTracker do
  let(:user) { create(:user) }
  let(:goal) { create(:goal, user: user, target_amount: 1000, current_amount: 0) }

  subject { described_class.new(goal) }

  describe "#check_and_record" do
    context "when goal has zero target amount" do
      let(:goal) { build(:goal, user: user, target_amount: 0, current_amount: 0) }

      before { goal.save(validate: false) }

      it "returns empty array" do
        expect(subject.check_and_record).to eq([])
      end
    end

    context "when goal is at 0%" do
      it "returns empty array" do
        expect(subject.check_and_record).to eq([])
      end

      it "does not create milestones" do
        expect { subject.check_and_record }.not_to change(Milestone, :count)
      end
    end

    context "when goal reaches 25%" do
      before { goal.update!(current_amount: 250) }

      it "records 25% milestone" do
        milestones = subject.check_and_record
        expect(milestones.size).to eq(1)
        expect(milestones.first.percentage).to eq(25)
      end

      it "sets achieved_at to current time" do
        milestones = subject.check_and_record
        expect(milestones.first.achieved_at).to be_within(1.second).of(Time.current)
      end
    end

    context "when goal reaches 50%" do
      before { goal.update!(current_amount: 500) }

      it "records both 25% and 50% milestones" do
        milestones = subject.check_and_record
        expect(milestones.map(&:percentage)).to contain_exactly(25, 50)
      end
    end

    context "when goal reaches 100%" do
      before { goal.update!(current_amount: 1000) }

      it "records all milestones" do
        milestones = subject.check_and_record
        expect(milestones.map(&:percentage)).to contain_exactly(25, 50, 75, 100)
      end
    end

    context "when goal exceeds 100%" do
      before { goal.update!(current_amount: 1500) }

      it "records all milestones" do
        milestones = subject.check_and_record
        expect(milestones.map(&:percentage)).to contain_exactly(25, 50, 75, 100)
      end
    end

    context "when milestones already exist" do
      before do
        goal.update!(current_amount: 500)
        create(:milestone, goal: goal, percentage: 25, achieved_at: 1.day.ago)
      end

      it "only records new milestones" do
        milestones = subject.check_and_record
        expect(milestones.size).to eq(1)
        expect(milestones.first.percentage).to eq(50)
      end

      it "does not duplicate existing milestones" do
        expect { subject.check_and_record }.to change(Milestone, :count).by(1)
      end
    end

    context "when goal progresses incrementally" do
      it "tracks milestones across multiple contributions" do
        goal.update!(current_amount: 250)
        first_batch = subject.check_and_record
        expect(first_batch.map(&:percentage)).to eq([ 25 ])

        goal.update!(current_amount: 750)
        second_batch = subject.check_and_record
        expect(second_batch.map(&:percentage)).to contain_exactly(50, 75)

        goal.update!(current_amount: 1000)
        third_batch = subject.check_and_record
        expect(third_batch.map(&:percentage)).to eq([ 100 ])
      end
    end

    context "when goal decreases below milestone" do
      before do
        goal.update!(current_amount: 500)
        subject.check_and_record
        goal.update!(current_amount: 200)
      end

      it "does not remove existing milestones" do
        expect(goal.milestones.count).to eq(2)
      end

      it "does not re-record milestones when progress increases again" do
        goal.update!(current_amount: 500)
        new_milestones = subject.check_and_record
        expect(new_milestones).to be_empty
      end
    end
  end
end
