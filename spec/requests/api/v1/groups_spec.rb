require 'rails_helper'

RSpec.describe 'Api::V1::Groups', type: :request do
  let!(:user) { create(:user) }

  def login_user
    post '/api/v1/login', params: { email: user.email, password: 'password123' }
  end

  describe 'GET /api/v1/groups' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get '/api/v1/groups'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { login_user }

      it 'returns empty list when user has no groups' do
        get '/api/v1/groups'
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['groups']).to eq([])
      end

      it 'returns groups the user is a member of' do
        group = create(:group, created_by: user)
        get '/api/v1/groups'
        json = JSON.parse(response.body)
        expect(json['groups'].length).to eq(1)
        expect(json['groups'][0]['name']).to eq(group.name)
      end
    end
  end

  describe 'POST /api/v1/groups' do
    before { login_user }

    it 'creates a group and adds user as admin' do
      post '/api/v1/groups', params: { name: 'Family' }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['group']['name']).to eq('Family')
      expect(json['group']['is_admin']).to be true
    end

    it 'returns error for blank name' do
      post '/api/v1/groups', params: { name: '' }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'GET /api/v1/groups/:id' do
    before { login_user }

    it 'returns group with members' do
      group = create(:group, created_by: user)
      get "/api/v1/groups/#{group.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['group']['members'].length).to eq(1)
    end

    it 'returns not found for non-member' do
      other_user = create(:user)
      group = create(:group, created_by: other_user)
      get "/api/v1/groups/#{group.id}"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH /api/v1/groups/:id' do
    before { login_user }

    it 'updates group as admin' do
      group = create(:group, created_by: user)
      patch "/api/v1/groups/#{group.id}", params: { name: 'Updated Name' }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['group']['name']).to eq('Updated Name')
    end

    it 'returns forbidden for non-admin' do
      admin = create(:user)
      group = create(:group, created_by: admin)
      group.memberships.create!(user: user, role: 'member')
      patch "/api/v1/groups/#{group.id}", params: { name: 'Hacked' }
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'DELETE /api/v1/groups/:id' do
    before { login_user }

    it 'deletes group as admin' do
      group = create(:group, created_by: user)
      delete "/api/v1/groups/#{group.id}"
      expect(response).to have_http_status(:no_content)
      expect(Group.exists?(group.id)).to be false
    end
  end

  describe 'POST /api/v1/groups/join' do
    before { login_user }

    it 'joins group with valid invite code' do
      admin = create(:user)
      group = create(:group, created_by: admin)
      post '/api/v1/groups/join', params: { invite_code: group.invite_code }
      expect(response).to have_http_status(:created)
      expect(group.member?(user)).to be true
    end

    it 'returns not found for invalid code' do
      post '/api/v1/groups/join', params: { invite_code: 'invalid' }
      expect(response).to have_http_status(:not_found)
    end

    it 'returns error if already a member' do
      group = create(:group, created_by: user)
      post '/api/v1/groups/join', params: { invite_code: group.invite_code }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'POST /api/v1/groups/:id/regenerate_invite' do
    before { login_user }

    it 'regenerates invite code as admin' do
      group = create(:group, created_by: user)
      old_code = group.invite_code
      post "/api/v1/groups/#{group.id}/regenerate_invite"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['group']['invite_code']).not_to eq(old_code)
    end
  end
end
