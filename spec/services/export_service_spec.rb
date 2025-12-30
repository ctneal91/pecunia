require 'rails_helper'

RSpec.describe ExportService do
  let(:user) { create(:user) }
  let(:service) { described_class.new(user) }

  describe '#goals_csv' do
    it 'returns CSV with headers' do
      csv = service.goals_csv
      lines = csv.split("\n")
      expect(lines.first).to include('id', 'title', 'target_amount')
    end

    it 'includes user goals' do
      goal = create(:goal, :with_user, user: user, title: 'Test Goal')
      csv = service.goals_csv
      expect(csv).to include('Test Goal')
    end

    it 'does not include other users goals' do
      other_user = create(:user, email: 'other@example.com')
      create(:goal, :with_user, user: other_user, title: 'Other Goal')
      csv = service.goals_csv
      expect(csv).not_to include('Other Goal')
    end

    it 'includes group goals user is member of' do
      group = create(:group, created_by: user)
      goal = create(:goal, :with_user, user: user, group: group, title: 'Group Goal')
      csv = service.goals_csv
      expect(csv).to include('Group Goal')
    end
  end

  describe '#goals_json' do
    it 'returns array of goal data' do
      create(:goal, :with_user, user: user, title: 'JSON Goal')
      result = service.goals_json
      expect(result).to be_an(Array)
      expect(result.first[:title]).to eq('JSON Goal')
    end
  end

  describe '#contributions_csv' do
    let(:goal) { create(:goal, :with_user, user: user, title: 'My Goal') }
    let!(:contribution) { create(:contribution, goal: goal, amount: 100) }

    it 'returns CSV with contribution data' do
      csv = service.contributions_csv
      expect(csv).to include('My Goal')
      expect(csv).to include('100')
    end

    it 'filters by goal_id when provided' do
      other_goal = create(:goal, :with_user, user: user, title: 'Other Goal')
      create(:contribution, goal: other_goal, amount: 200)

      csv = service.contributions_csv(goal.id)
      expect(csv).to include('My Goal')
      expect(csv).not_to include('Other Goal')
    end
  end

  describe '#contributions_json' do
    let(:goal) { create(:goal, :with_user, user: user, title: 'JSON Goal') }
    let!(:contribution) { create(:contribution, goal: goal, amount: 150) }

    it 'returns array with goal_title included' do
      result = service.contributions_json
      expect(result.first[:goal_title]).to eq('JSON Goal')
    end
  end

  describe '#summary_report' do
    before do
      create(:goal, :with_user, user: user, goal_type: 'savings', target_amount: 1000, current_amount: 500)
      create(:goal, :with_user, :completed, user: user, goal_type: 'savings')
    end

    it 'includes generated_at timestamp' do
      result = service.summary_report
      expect(result[:generated_at]).to be_present
    end

    it 'includes user info' do
      result = service.summary_report
      expect(result[:user][:email]).to eq(user.email)
    end

    it 'includes summary statistics' do
      result = service.summary_report
      expect(result[:summary][:total_goals]).to eq(2)
      expect(result[:summary][:completed_count]).to eq(1)
    end

    it 'includes category breakdown' do
      result = service.summary_report
      expect(result[:by_category]).to be_an(Array)
      savings_cat = result[:by_category].find { |c| c[:goal_type] == 'savings' }
      expect(savings_cat[:goal_count]).to eq(2)
    end

    it 'includes goals array' do
      result = service.summary_report
      expect(result[:goals].length).to eq(2)
    end
  end

  describe '#goal_report' do
    let(:goal) { create(:goal, :with_user, user: user, title: 'Report Goal') }
    let!(:contribution) { create(:contribution, goal: goal, amount: 100) }

    it 'includes goal details' do
      result = service.goal_report(goal.id)
      expect(result[:goal][:title]).to eq('Report Goal')
    end

    it 'includes contributions' do
      result = service.goal_report(goal.id)
      expect(result[:contributions].length).to eq(1)
    end

    it 'includes statistics' do
      result = service.goal_report(goal.id)
      expect(result[:statistics][:total_contributions]).to eq(1)
      expect(result[:statistics][:total_contributed].to_f).to eq(100.0)
    end

    it 'raises error for inaccessible goal' do
      other_user = create(:user, email: 'other@example.com')
      other_goal = create(:goal, :with_user, user: other_user)
      expect {
        service.goal_report(other_goal.id)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
