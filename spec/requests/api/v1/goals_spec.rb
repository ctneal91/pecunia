require 'rails_helper'

RSpec.describe 'Api::V1::Goals', type: :request do
  let!(:user) { create(:user) }

  def login_user
    post '/api/v1/login', params: { email: user.email, password: 'password123' }
  end

  describe 'GET /api/v1/goals' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get '/api/v1/goals'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { login_user }

      it 'returns empty array when no goals' do
        get '/api/v1/goals'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['goals']).to eq([])
      end

      it 'returns user goals' do
        goal = create(:goal, :with_user, user: user)
        get '/api/v1/goals'
        json = JSON.parse(response.body)
        expect(json['goals'].length).to eq(1)
        expect(json['goals'][0]['title']).to eq(goal.title)
      end

      it 'does not return other users goals' do
        other_user = create(:user, email: 'other@example.com')
        create(:goal, :with_user, user: other_user)
        create(:goal, :with_user, user: user)

        get '/api/v1/goals'
        json = JSON.parse(response.body)
        expect(json['goals'].length).to eq(1)
      end
    end
  end

  describe 'GET /api/v1/goals/:id' do
    context 'when logged in' do
      before { login_user }

      it 'returns the goal' do
        goal = create(:goal, :with_user, user: user)
        get "/api/v1/goals/#{goal.id}"
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['goal']['id']).to eq(goal.id)
      end

      it 'returns not found for other users goal' do
        other_user = create(:user, email: 'other@example.com')
        goal = create(:goal, :with_user, user: other_user)
        get "/api/v1/goals/#{goal.id}"
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/goals' do
    let(:valid_params) do
      {
        title: 'Emergency Fund',
        target_amount: 10000,
        goal_type: 'emergency_fund'
      }
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        post '/api/v1/goals', params: valid_params
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { login_user }

      it 'creates a goal' do
        expect {
          post '/api/v1/goals', params: valid_params
        }.to change(Goal, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it 'returns the created goal' do
        post '/api/v1/goals', params: valid_params
        json = JSON.parse(response.body)
        expect(json['goal']['title']).to eq('Emergency Fund')
        expect(json['goal']['progress_percentage'].to_f).to eq(0)
      end

      it 'returns errors for invalid params' do
        post '/api/v1/goals', params: { title: '' }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
  end

  describe 'PATCH /api/v1/goals/:id' do
    context 'when logged in' do
      before { login_user }

      it 'updates the goal' do
        goal = create(:goal, :with_user, user: user, current_amount: 0)
        patch "/api/v1/goals/#{goal.id}", params: { current_amount: 5000 }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['goal']['current_amount'].to_f).to eq(5000)
        expect(json['goal']['progress_percentage'].to_f).to eq(50.0)
      end

      it 'cannot update other users goals' do
        other_user = create(:user, email: 'other@example.com')
        goal = create(:goal, :with_user, user: other_user)
        patch "/api/v1/goals/#{goal.id}", params: { current_amount: 5000 }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /api/v1/goals/:id' do
    context 'when logged in' do
      before { login_user }

      it 'deletes the goal' do
        goal = create(:goal, :with_user, user: user)
        expect {
          delete "/api/v1/goals/#{goal.id}"
        }.to change(Goal, :count).by(-1)
        expect(response).to have_http_status(:no_content)
      end

      it 'cannot delete other users goals' do
        other_user = create(:user, email: 'other@example.com')
        goal = create(:goal, :with_user, user: other_user)
        expect {
          delete "/api/v1/goals/#{goal.id}"
        }.not_to change(Goal, :count)
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/goals/bulk_create' do
    let(:goals_params) do
      {
        goals: [
          { title: 'Goal 1', target_amount: 1000, goal_type: 'savings' },
          { title: 'Goal 2', target_amount: 2000, goal_type: 'emergency_fund' }
        ]
      }
    end

    context 'when logged in' do
      before { login_user }

      it 'creates multiple goals' do
        expect {
          post '/api/v1/goals/bulk_create', params: goals_params
        }.to change(Goal, :count).by(2)
        expect(response).to have_http_status(:created)
      end

      it 'returns all created goals' do
        post '/api/v1/goals/bulk_create', params: goals_params
        json = JSON.parse(response.body)
        expect(json['goals'].length).to eq(2)
      end

      it 'rolls back on error' do
        invalid_params = {
          goals: [
            { title: 'Goal 1', target_amount: 1000, goal_type: 'savings' },
            { title: '', target_amount: 2000, goal_type: 'invalid' }
          ]
        }
        expect {
          post '/api/v1/goals/bulk_create', params: invalid_params
        }.not_to change(Goal, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'GET /api/v1/goals/by_category' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get '/api/v1/goals/by_category'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { login_user }

      it 'returns categories array with all goal types' do
        get '/api/v1/goals/by_category'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['categories']).to be_an(Array)
        expect(json['categories'].length).to eq(Goal::GOAL_TYPES.length)
      end

      it 'returns empty goals array for categories with no goals' do
        get '/api/v1/goals/by_category'
        json = JSON.parse(response.body)
        savings_category = json['categories'].find { |c| c['goal_type'] == 'savings' }
        expect(savings_category['goals']).to eq([])
        expect(savings_category['goal_count']).to eq(0)
      end

      it 'groups goals by their type' do
        create(:goal, :with_user, user: user, goal_type: 'savings', title: 'Savings 1')
        create(:goal, :with_user, user: user, goal_type: 'savings', title: 'Savings 2')
        create(:goal, :with_user, user: user, goal_type: 'vacation', title: 'Vacation')

        get '/api/v1/goals/by_category'
        json = JSON.parse(response.body)

        savings_category = json['categories'].find { |c| c['goal_type'] == 'savings' }
        vacation_category = json['categories'].find { |c| c['goal_type'] == 'vacation' }
        emergency_category = json['categories'].find { |c| c['goal_type'] == 'emergency_fund' }

        expect(savings_category['goal_count']).to eq(2)
        expect(vacation_category['goal_count']).to eq(1)
        expect(emergency_category['goal_count']).to eq(0)
      end

      it 'calculates category statistics correctly' do
        create(:goal, :with_user, user: user, goal_type: 'savings', target_amount: 1000, current_amount: 500)
        create(:goal, :with_user, user: user, goal_type: 'savings', target_amount: 2000, current_amount: 1000)

        get '/api/v1/goals/by_category'
        json = JSON.parse(response.body)

        savings_category = json['categories'].find { |c| c['goal_type'] == 'savings' }
        expect(savings_category['total_saved'].to_f).to eq(1500.0)
        expect(savings_category['total_target'].to_f).to eq(3000.0)
        expect(savings_category['progress'].to_f).to eq(50.0)
        expect(savings_category['active_count']).to eq(2)
        expect(savings_category['completed_count']).to eq(0)
      end

      it 'counts completed goals correctly' do
        create(:goal, :with_user, user: user, goal_type: 'savings', target_amount: 1000, current_amount: 500)
        create(:goal, :with_user, :completed, user: user, goal_type: 'savings')

        get '/api/v1/goals/by_category'
        json = JSON.parse(response.body)

        savings_category = json['categories'].find { |c| c['goal_type'] == 'savings' }
        expect(savings_category['completed_count']).to eq(1)
        expect(savings_category['active_count']).to eq(1)
      end

      it 'does not include other users goals' do
        other_user = create(:user, email: 'other@example.com')
        create(:goal, :with_user, user: user, goal_type: 'savings')
        create(:goal, :with_user, user: other_user, goal_type: 'savings')

        get '/api/v1/goals/by_category'
        json = JSON.parse(response.body)

        savings_category = json['categories'].find { |c| c['goal_type'] == 'savings' }
        expect(savings_category['goal_count']).to eq(1)
      end
    end
  end
end
