require 'rails_helper'

RSpec.describe 'Api::V1::Exports', type: :request do
  let!(:user) { create(:user) }

  def login_user
    post '/api/v1/login', params: { email: user.email, password: 'password123' }
  end

  describe 'GET /api/v1/exports/goals' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get '/api/v1/exports/goals'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { login_user }

      it 'returns goals as JSON by default' do
        create(:goal, :with_user, user: user, title: 'Export Goal')
        get '/api/v1/exports/goals'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']).to be_an(Array)
        expect(json['data'].first['title']).to eq('Export Goal')
      end

      it 'returns CSV when format=csv' do
        create(:goal, :with_user, user: user, title: 'CSV Goal')
        get '/api/v1/exports/goals', params: { format: 'csv' }
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/csv')
        expect(response.body).to include('CSV Goal')
      end
    end
  end

  describe 'GET /api/v1/exports/contributions' do
    context 'when logged in' do
      before { login_user }

      let(:goal) { create(:goal, :with_user, user: user, title: 'My Goal') }
      let!(:contribution) { create(:contribution, goal: goal, amount: 250) }

      it 'returns all contributions as JSON by default' do
        get '/api/v1/exports/contributions'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']).to be_an(Array)
        expect(json['data'].first['amount'].to_f).to eq(250.0)
      end

      it 'returns CSV when format=csv' do
        get '/api/v1/exports/contributions', params: { format: 'csv' }
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/csv')
        expect(response.body).to include('250')
      end

      it 'filters by goal_id when provided' do
        other_goal = create(:goal, :with_user, user: user, title: 'Other Goal')
        create(:contribution, goal: other_goal, amount: 500)

        get '/api/v1/exports/contributions', params: { goal_id: goal.id }
        json = JSON.parse(response.body)
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['goal_title']).to eq('My Goal')
      end
    end
  end

  describe 'GET /api/v1/exports/summary' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get '/api/v1/exports/summary'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { login_user }

      it 'returns summary report' do
        create(:goal, :with_user, user: user, target_amount: 1000, current_amount: 500)
        get '/api/v1/exports/summary'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['generated_at']).to be_present
        expect(json['user']['email']).to eq(user.email)
        expect(json['summary']['total_goals']).to eq(1)
        expect(json['by_category']).to be_an(Array)
      end
    end
  end

  describe 'GET /api/v1/exports/goals/:goal_id/report' do
    context 'when logged in' do
      before { login_user }

      let(:goal) { create(:goal, :with_user, user: user, title: 'Report Goal') }
      let!(:contribution) { create(:contribution, goal: goal, amount: 100) }

      it 'returns goal report' do
        get "/api/v1/exports/goals/#{goal.id}/report"
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['goal']['title']).to eq('Report Goal')
        expect(json['contributions']).to be_an(Array)
        expect(json['statistics']['total_contributions']).to eq(1)
      end

      it 'returns not found for inaccessible goal' do
        other_user = create(:user, email: 'other@example.com')
        other_goal = create(:goal, :with_user, user: other_user)
        get "/api/v1/exports/goals/#{other_goal.id}/report"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
