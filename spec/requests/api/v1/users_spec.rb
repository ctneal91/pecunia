require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  describe 'GET /api/v1/me' do
    context 'when logged in' do
      let!(:user) { create(:user, name: 'Test User', avatar_url: 'http://example.com/avatar.jpg') }

      before do
        post '/api/v1/login', params: { email: user.email, password: 'password123' }
      end

      it 'returns success' do
        get '/api/v1/me'
        expect(response).to have_http_status(:ok)
      end

      it 'returns the current user data' do
        get '/api/v1/me'
        json = JSON.parse(response.body)
        expect(json['user']['email']).to eq(user.email)
        expect(json['user']['name']).to eq('Test User')
        expect(json['user']['avatar_url']).to eq('http://example.com/avatar.jpg')
      end
    end

    context 'when not logged in' do
      it 'returns success with null user' do
        get '/api/v1/me'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user']).to be_nil
      end
    end
  end

  describe 'PATCH /api/v1/me' do
    context 'when logged in' do
      let!(:user) { create(:user) }

      before do
        post '/api/v1/login', params: { email: user.email, password: 'password123' }
      end

      it 'updates the user name' do
        patch '/api/v1/me', params: { name: 'Updated Name' }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user']['name']).to eq('Updated Name')
      end

      it 'updates the user avatar_url' do
        patch '/api/v1/me', params: { avatar_url: 'http://example.com/new-avatar.jpg' }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user']['avatar_url']).to eq('http://example.com/new-avatar.jpg')
      end

      it 'updates the password' do
        patch '/api/v1/me', params: { password: 'newpassword', password_confirmation: 'newpassword' }
        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.authenticate('newpassword')).to eq(user)
      end

      it 'returns error for invalid password' do
        patch '/api/v1/me', params: { password: '123', password_confirmation: '123' }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        patch '/api/v1/me', params: { name: 'Updated Name' }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
