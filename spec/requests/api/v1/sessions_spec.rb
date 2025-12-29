require 'rails_helper'

RSpec.describe 'Api::V1::Sessions', type: :request do
  describe 'POST /api/v1/login' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

    context 'with valid credentials' do
      it 'returns success' do
        post '/api/v1/login', params: { email: 'test@example.com', password: 'password123' }
        expect(response).to have_http_status(:ok)
      end

      it 'returns the user data' do
        post '/api/v1/login', params: { email: 'test@example.com', password: 'password123' }
        json = JSON.parse(response.body)
        expect(json['user']['email']).to eq('test@example.com')
      end

      it 'sets the session' do
        post '/api/v1/login', params: { email: 'test@example.com', password: 'password123' }
        expect(session[:user_id]).to eq(user.id)
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized for wrong password' do
        post '/api/v1/login', params: { email: 'test@example.com', password: 'wrongpassword' }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns unauthorized for non-existent user' do
        post '/api/v1/login', params: { email: 'nonexistent@example.com', password: 'password123' }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns error message' do
        post '/api/v1/login', params: { email: 'test@example.com', password: 'wrongpassword' }
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid email or password')
      end
    end
  end

  describe 'DELETE /api/v1/logout' do
    let!(:user) { create(:user) }

    before do
      post '/api/v1/login', params: { email: user.email, password: 'password123' }
    end

    it 'returns no content' do
      delete '/api/v1/logout'
      expect(response).to have_http_status(:no_content)
    end

    it 'clears the session' do
      delete '/api/v1/logout'
      expect(session[:user_id]).to be_nil
    end
  end
end
