require 'rails_helper'

RSpec.describe 'Api::V1::Dashboard', type: :request do
  let!(:user) { create(:user) }

  def login_user
    post '/api/v1/login', params: { email: user.email, password: 'password123' }
  end

  describe 'GET /api/v1/dashboard' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get '/api/v1/dashboard'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in with no goals' do
      before { login_user }

      it 'returns empty stats' do
        get '/api/v1/dashboard'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)

        expect(json['stats']['total_saved']).to eq(0)
        expect(json['stats']['goal_count']).to eq(0)
        expect(json['recent_contributions']).to eq([])
        expect(json['goals_summary']).to eq([])
      end
    end

    context 'when logged in with goals and contributions' do
      before do
        login_user
        @goal1 = create(:goal, user: user, target_amount: 10000, current_amount: 0)
        @goal2 = create(:goal, user: user, target_amount: 5000, current_amount: 5000)
        create(:contribution, goal: @goal1, user: user, amount: 1000)
        create(:contribution, goal: @goal1, user: user, amount: 500)
      end

      it 'returns correct stats' do
        get '/api/v1/dashboard'
        json = JSON.parse(response.body)

        expect(json['stats']['goal_count']).to eq(2)
        expect(json['stats']['completed_count']).to eq(1)
        expect(json['stats']['active_count']).to eq(1)
      end

      it 'returns recent contributions' do
        get '/api/v1/dashboard'
        json = JSON.parse(response.body)

        expect(json['recent_contributions'].length).to eq(2)
        expect(json['recent_contributions'][0]['goal']['title']).to eq(@goal1.title)
      end

      it 'returns goals summary' do
        get '/api/v1/dashboard'
        json = JSON.parse(response.body)

        expect(json['goals_summary'].length).to eq(2)
      end
    end
  end
end
