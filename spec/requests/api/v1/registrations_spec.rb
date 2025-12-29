require 'rails_helper'

RSpec.describe 'Api::V1::Registrations', type: :request do
  describe 'POST /api/v1/signup' do
    let(:valid_params) do
      {
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'New User'
      }
    end

    context 'with valid parameters' do
      it 'creates a new user' do
        expect {
          post '/api/v1/signup', params: valid_params
        }.to change(User, :count).by(1)
      end

      it 'returns created status' do
        post '/api/v1/signup', params: valid_params
        expect(response).to have_http_status(:created)
      end

      it 'returns the user data' do
        post '/api/v1/signup', params: valid_params
        json = JSON.parse(response.body)
        expect(json['user']['email']).to eq('newuser@example.com')
        expect(json['user']['name']).to eq('New User')
      end

      it 'logs in the user' do
        post '/api/v1/signup', params: valid_params
        expect(session[:user_id]).to eq(User.last.id)
      end
    end

    context 'with invalid parameters' do
      it 'returns unprocessable entity for missing email' do
        post '/api/v1/signup', params: valid_params.except(:email)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns unprocessable entity for invalid email' do
        post '/api/v1/signup', params: valid_params.merge(email: 'invalid')
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns unprocessable entity for short password' do
        post '/api/v1/signup', params: valid_params.merge(password: '12345', password_confirmation: '12345')
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns unprocessable entity for duplicate email' do
        create(:user, email: 'newuser@example.com')
        post '/api/v1/signup', params: valid_params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns error messages' do
        post '/api/v1/signup', params: valid_params.merge(email: 'invalid')
        json = JSON.parse(response.body)
        expect(json['errors']).to include('Email is invalid')
      end
    end
  end
end
