require 'rails_helper'

RSpec.describe 'Api::V1::RecurringContributions', type: :request do
  let!(:user) { create(:user) }
  let!(:goal) { create(:goal, user: user, current_amount: 0) }

  def login_user
    post '/api/v1/login', params: { email: user.email, password: 'password123' }
  end

  describe 'GET /api/v1/goals/:goal_id/recurring_contributions' do
    context 'when logged in' do
      before { login_user }

      it 'returns empty array when no recurring contributions' do
        get "/api/v1/goals/#{goal.id}/recurring_contributions"
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['recurring_contributions']).to eq([])
      end

      it 'returns recurring contributions for the goal' do
        recurring = create(:recurring_contribution, goal: goal, user: user)
        get "/api/v1/goals/#{goal.id}/recurring_contributions"
        json = JSON.parse(response.body)
        expect(json['recurring_contributions'].length).to eq(1)
        expect(json['recurring_contributions'][0]['id']).to eq(recurring.id)
      end

      it 'includes all expected fields' do
        recurring = create(:recurring_contribution,
                           goal: goal,
                           user: user,
                           amount: 150,
                           frequency: 'weekly',
                           note: 'Weekly savings')
        get "/api/v1/goals/#{goal.id}/recurring_contributions"
        json = JSON.parse(response.body)
        rc = json['recurring_contributions'][0]

        expect(rc['amount']).to eq(150)
        expect(rc['frequency']).to eq('weekly')
        expect(rc['note']).to eq('Weekly savings')
        expect(rc['is_active']).to be true
        expect(rc['next_occurrence_at']).to be_present
      end
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        get "/api/v1/goals/#{goal.id}/recurring_contributions"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/goals/:goal_id/recurring_contributions' do
    let(:valid_params) do
      {
        amount: 100,
        frequency: 'monthly',
        next_occurrence_at: 1.day.from_now.iso8601
      }
    end

    context 'when logged in' do
      before { login_user }

      it 'creates a recurring contribution' do
        expect {
          post "/api/v1/goals/#{goal.id}/recurring_contributions", params: valid_params
        }.to change(RecurringContribution, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it 'returns the recurring contribution' do
        post "/api/v1/goals/#{goal.id}/recurring_contributions", params: valid_params
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['amount'].to_f).to eq(100)
        expect(json['recurring_contribution']['frequency']).to eq('monthly')
      end

      it 'sets the current user as the owner' do
        post "/api/v1/goals/#{goal.id}/recurring_contributions", params: valid_params
        recurring = RecurringContribution.last
        expect(recurring.user).to eq(user)
      end

      it 'accepts all valid frequencies' do
        %w[daily weekly biweekly monthly].each do |freq|
          params = valid_params.merge(frequency: freq)
          post "/api/v1/goals/#{goal.id}/recurring_contributions", params: params
          expect(response).to have_http_status(:created)
        end
      end

      it 'accepts optional end_date' do
        params = valid_params.merge(end_date: 6.months.from_now.iso8601)
        post "/api/v1/goals/#{goal.id}/recurring_contributions", params: params
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['end_date']).to be_present
      end

      it 'accepts optional note' do
        params = valid_params.merge(note: 'Monthly savings')
        post "/api/v1/goals/#{goal.id}/recurring_contributions", params: params
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['note']).to eq('Monthly savings')
      end

      context 'with invalid params' do
        it 'returns errors for missing amount' do
          post "/api/v1/goals/#{goal.id}/recurring_contributions",
               params: valid_params.except(:amount)
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns errors for invalid frequency' do
          post "/api/v1/goals/#{goal.id}/recurring_contributions",
               params: valid_params.merge(frequency: 'invalid')
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns errors for amount <= 0' do
          post "/api/v1/goals/#{goal.id}/recurring_contributions",
               params: valid_params.merge(amount: 0)
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end
  end

  describe 'PATCH /api/v1/goals/:goal_id/recurring_contributions/:id' do
    let!(:recurring) { create(:recurring_contribution, goal: goal, user: user, amount: 100) }

    context 'when logged in' do
      before { login_user }

      it 'updates the recurring contribution' do
        patch "/api/v1/goals/#{goal.id}/recurring_contributions/#{recurring.id}",
              params: { amount: 200 }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['amount'].to_f).to eq(200)
      end

      it 'can update frequency' do
        patch "/api/v1/goals/#{goal.id}/recurring_contributions/#{recurring.id}",
              params: { frequency: 'weekly' }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['frequency']).to eq('weekly')
      end

      it 'can pause by setting is_active to false' do
        patch "/api/v1/goals/#{goal.id}/recurring_contributions/#{recurring.id}",
              params: { is_active: false }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['is_active']).to be false
      end

      it 'can resume by setting is_active to true' do
        recurring.update!(is_active: false)
        patch "/api/v1/goals/#{goal.id}/recurring_contributions/#{recurring.id}",
              params: { is_active: true }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['recurring_contribution']['is_active']).to be true
      end

      it 'returns not found for non-existent recurring contribution' do
        patch "/api/v1/goals/#{goal.id}/recurring_contributions/999999",
              params: { amount: 200 }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /api/v1/goals/:goal_id/recurring_contributions/:id' do
    let!(:recurring) { create(:recurring_contribution, goal: goal, user: user) }

    context 'when logged in' do
      before { login_user }

      it 'deletes the recurring contribution' do
        expect {
          delete "/api/v1/goals/#{goal.id}/recurring_contributions/#{recurring.id}"
        }.to change(RecurringContribution, :count).by(-1)
        expect(response).to have_http_status(:ok)
      end

      it 'returns not found for non-existent recurring contribution' do
        delete "/api/v1/goals/#{goal.id}/recurring_contributions/999999"
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'goal access control' do
    let(:other_user) { create(:user, email: 'other@example.com') }
    let(:other_goal) { create(:goal, user: other_user) }

    before { login_user }

    it 'returns not found when accessing another user\'s goal' do
      get "/api/v1/goals/#{other_goal.id}/recurring_contributions"
      expect(response).to have_http_status(:not_found)
    end
  end
end
