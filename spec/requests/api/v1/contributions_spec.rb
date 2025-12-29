require 'rails_helper'

RSpec.describe 'Api::V1::Contributions', type: :request do
  let!(:user) { create(:user) }
  let!(:goal) { create(:goal, user: user, current_amount: 0) }

  def login_user
    post '/api/v1/login', params: { email: user.email, password: 'password123' }
  end

  describe 'GET /api/v1/goals/:goal_id/contributions' do
    context 'when logged in' do
      before { login_user }

      it 'returns empty array when no contributions' do
        get "/api/v1/goals/#{goal.id}/contributions"
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['contributions']).to eq([])
      end

      it 'returns contributions for the goal' do
        contribution = create(:contribution, goal: goal, user: user)
        get "/api/v1/goals/#{goal.id}/contributions"
        json = JSON.parse(response.body)
        expect(json['contributions'].length).to eq(1)
        expect(json['contributions'][0]['id']).to eq(contribution.id)
      end
    end
  end

  describe 'POST /api/v1/goals/:goal_id/contributions' do
    let(:valid_params) { { amount: 500, contributed_at: Time.current.iso8601 } }

    context 'when logged in' do
      before { login_user }

      it 'creates a contribution' do
        expect {
          post "/api/v1/goals/#{goal.id}/contributions", params: valid_params
        }.to change(Contribution, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it 'updates the goal current_amount' do
        post "/api/v1/goals/#{goal.id}/contributions", params: valid_params
        json = JSON.parse(response.body)
        expect(json['goal']['current_amount'].to_f).to eq(500)
        expect(json['goal']['progress_percentage'].to_f).to eq(5.0)
      end

      it 'returns the contribution and updated goal' do
        post "/api/v1/goals/#{goal.id}/contributions", params: valid_params
        json = JSON.parse(response.body)
        expect(json['contribution']['amount'].to_f).to eq(500)
        expect(json['goal']).to be_present
      end

      it 'allows negative amounts for withdrawals' do
        create(:contribution, goal: goal, amount: 1000)
        post "/api/v1/goals/#{goal.id}/contributions", params: { amount: -200, contributed_at: Time.current.iso8601 }
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['goal']['current_amount'].to_f).to eq(800)
      end
    end
  end

  describe 'PATCH /api/v1/goals/:goal_id/contributions/:id' do
    let!(:contribution) { create(:contribution, goal: goal, user: user, amount: 100) }

    context 'when logged in' do
      before { login_user }

      it 'updates the contribution' do
        patch "/api/v1/goals/#{goal.id}/contributions/#{contribution.id}", params: { amount: 200 }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['contribution']['amount'].to_f).to eq(200)
      end

      it 'updates the goal current_amount' do
        patch "/api/v1/goals/#{goal.id}/contributions/#{contribution.id}", params: { amount: 300 }
        json = JSON.parse(response.body)
        expect(json['goal']['current_amount'].to_f).to eq(300)
      end
    end
  end

  describe 'DELETE /api/v1/goals/:goal_id/contributions/:id' do
    let!(:contribution) { create(:contribution, goal: goal, user: user, amount: 100) }

    context 'when logged in' do
      before { login_user }

      it 'deletes the contribution' do
        expect {
          delete "/api/v1/goals/#{goal.id}/contributions/#{contribution.id}"
        }.to change(Contribution, :count).by(-1)
        expect(response).to have_http_status(:ok)
      end

      it 'updates the goal current_amount' do
        delete "/api/v1/goals/#{goal.id}/contributions/#{contribution.id}"
        json = JSON.parse(response.body)
        expect(json['goal']['current_amount'].to_f).to eq(0)
      end
    end
  end
end
