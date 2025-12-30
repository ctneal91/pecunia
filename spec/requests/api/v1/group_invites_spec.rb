require 'rails_helper'

RSpec.describe 'Api::V1::GroupInvites', type: :request do
  let!(:user) { create(:user) }
  let!(:admin) { create(:user) }
  let!(:group) { create(:group, created_by: admin) }

  def login_as(login_user)
    post '/api/v1/login', params: { email: login_user.email, password: 'password123' }
  end

  describe 'GET /api/v1/groups/:group_id/invites' do
    before do
      group.memberships.create!(user: user, role: 'member')
      login_as(user)
    end

    it 'returns list of invites' do
      invite = create(:group_invite, group: group, invited_by: admin)
      get "/api/v1/groups/#{group.id}/invites"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['invites'].length).to eq(1)
      expect(json['invites'][0]['email']).to eq(invite.email)
    end

    it 'returns empty list when no invites' do
      get "/api/v1/groups/#{group.id}/invites"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['invites']).to eq([])
    end

    it 'returns not found for non-member' do
      other_group = create(:group, created_by: create(:user))
      get "/api/v1/groups/#{other_group.id}/invites"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/groups/:group_id/invites' do
    before { login_as(admin) }

    it 'creates invite as admin' do
      expect {
        post "/api/v1/groups/#{group.id}/invites", params: { email: 'newuser@example.com' }
      }.to change(GroupInvite, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['invite']['email']).to eq('newuser@example.com')
    end

    it 'normalizes email' do
      post "/api/v1/groups/#{group.id}/invites", params: { email: '  UPPER@EXAMPLE.COM  ' }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['invite']['email']).to eq('upper@example.com')
    end

    it 'sends invitation email' do
      expect {
        post "/api/v1/groups/#{group.id}/invites", params: { email: 'friend@example.com' }
      }.to have_enqueued_mail(GroupInviteMailer, :invite)
    end

    it 'returns error if email already member' do
      group.memberships.create!(user: user, role: 'member')
      post "/api/v1/groups/#{group.id}/invites", params: { email: user.email }
      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['error']).to include('already a member')
    end

    it 'returns error if pending invite exists' do
      create(:group_invite, group: group, invited_by: admin, email: 'existing@example.com')
      post "/api/v1/groups/#{group.id}/invites", params: { email: 'existing@example.com' }
      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['error']).to include('already been sent')
    end

    it 'returns error for invalid email' do
      post "/api/v1/groups/#{group.id}/invites", params: { email: 'invalid' }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns forbidden for non-admin member' do
      group.memberships.create!(user: user, role: 'member')
      login_as(user)
      post "/api/v1/groups/#{group.id}/invites", params: { email: 'friend@example.com' }
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /api/v1/groups/:group_id/invites/:id/resend' do
    before { login_as(admin) }

    it 'resends pending invite' do
      invite = create(:group_invite, group: group, invited_by: admin)
      expect {
        post "/api/v1/groups/#{group.id}/invites/#{invite.id}/resend"
      }.to have_enqueued_mail(GroupInviteMailer, :invite)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['message']).to eq('Invitation resent')
    end

    it 'refreshes token for expired invite' do
      invite = create(:group_invite, group: group, invited_by: admin)
      invite.update_column(:created_at, 8.days.ago)
      old_token = invite.token

      post "/api/v1/groups/#{group.id}/invites/#{invite.id}/resend"
      expect(response).to have_http_status(:ok)
      expect(invite.reload.token).not_to eq(old_token)
    end

    it 'returns not found for non-pending invite' do
      invite = create(:group_invite, group: group, invited_by: admin, status: 'accepted')
      post "/api/v1/groups/#{group.id}/invites/#{invite.id}/resend"
      expect(response).to have_http_status(:not_found)
    end

    it 'returns forbidden for non-admin' do
      group.memberships.create!(user: user, role: 'member')
      login_as(user)
      invite = create(:group_invite, group: group, invited_by: admin)
      post "/api/v1/groups/#{group.id}/invites/#{invite.id}/resend"
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'GET /api/v1/invites/:token' do
    it 'returns invite details without authentication' do
      invite = create(:group_invite, group: group, invited_by: admin)
      get "/api/v1/invites/#{invite.token}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['invite']['group_name']).to eq(group.name)
      expect(json['invite']['status']).to eq('pending')
    end

    it 'returns inviter name when available' do
      admin.update!(name: 'Admin User')
      invite = create(:group_invite, group: group, invited_by: admin)
      get "/api/v1/invites/#{invite.token}"
      json = JSON.parse(response.body)
      expect(json['invite']['inviter_name']).to eq('Admin User')
    end

    it 'uses email prefix when inviter has no name' do
      admin.update!(name: nil)
      invite = create(:group_invite, group: group, invited_by: admin)
      get "/api/v1/invites/#{invite.token}"
      json = JSON.parse(response.body)
      expect(json['invite']['inviter_name']).to eq(admin.email.split('@').first)
    end

    it 'returns not found for invalid token' do
      get '/api/v1/invites/invalid_token'
      expect(response).to have_http_status(:not_found)
    end

    it 'returns gone for expired pending invite' do
      invite = create(:group_invite, group: group, invited_by: admin)
      invite.update_column(:created_at, 8.days.ago)
      get "/api/v1/invites/#{invite.token}"
      expect(response).to have_http_status(:gone)
    end

    it 'returns ok for expired but accepted invite' do
      invite = create(:group_invite, group: group, invited_by: admin, status: 'accepted')
      invite.update_column(:created_at, 8.days.ago)
      get "/api/v1/invites/#{invite.token}"
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/invites/:token/accept' do
    before { login_as(user) }

    it 'accepts invite and joins group' do
      invite = create(:group_invite, group: group, invited_by: admin, email: user.email)
      post "/api/v1/invites/#{invite.token}/accept"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['group']['name']).to eq(group.name)
      expect(invite.reload.status).to eq('accepted')
      expect(group.member?(user)).to be true
    end

    it 'returns not found for invalid token' do
      post '/api/v1/invites/invalid_token/accept'
      expect(response).to have_http_status(:not_found)
    end

    it 'returns error for already accepted invite' do
      invite = create(:group_invite, group: group, invited_by: admin, status: 'accepted')
      post "/api/v1/invites/#{invite.token}/accept"
      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['error']).to include('already been accepted')
    end

    it 'returns error for declined invite' do
      invite = create(:group_invite, group: group, invited_by: admin, status: 'declined')
      post "/api/v1/invites/#{invite.token}/accept"
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns gone for expired invite' do
      invite = create(:group_invite, group: group, invited_by: admin)
      invite.update_column(:created_at, 8.days.ago)
      post "/api/v1/invites/#{invite.token}/accept"
      expect(response).to have_http_status(:gone)
    end

    it 'returns error if user already a member' do
      group.memberships.create!(user: user, role: 'member')
      invite = create(:group_invite, group: group, invited_by: admin, email: user.email)
      post "/api/v1/invites/#{invite.token}/accept"
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'POST /api/v1/invites/:token/decline' do
    before { login_as(user) }

    it 'declines invite' do
      invite = create(:group_invite, group: group, invited_by: admin)
      post "/api/v1/invites/#{invite.token}/decline"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['message']).to eq('Invitation declined')
      expect(invite.reload.status).to eq('declined')
    end

    it 'returns not found for invalid token' do
      post '/api/v1/invites/invalid_token/decline'
      expect(response).to have_http_status(:not_found)
    end

    it 'returns error for already processed invite' do
      invite = create(:group_invite, group: group, invited_by: admin, status: 'accepted')
      post "/api/v1/invites/#{invite.token}/decline"
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'GET /api/v1/invites/pending' do
    before { login_as(user) }

    it 'returns pending invites for current user email' do
      invite = create(:group_invite, group: group, invited_by: admin, email: user.email)
      get '/api/v1/invites/pending'
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['invites'].length).to eq(1)
      expect(json['invites'][0]['group_name']).to eq(group.name)
    end

    it 'excludes expired invites' do
      invite = create(:group_invite, group: group, invited_by: admin, email: user.email)
      invite.update_column(:created_at, 8.days.ago)
      get '/api/v1/invites/pending'
      json = JSON.parse(response.body)
      expect(json['invites']).to eq([])
    end

    it 'excludes non-pending invites' do
      create(:group_invite, group: group, invited_by: admin, email: user.email, status: 'accepted')
      get '/api/v1/invites/pending'
      json = JSON.parse(response.body)
      expect(json['invites']).to eq([])
    end

    it 'excludes invites for other emails' do
      create(:group_invite, group: group, invited_by: admin, email: 'other@example.com')
      get '/api/v1/invites/pending'
      json = JSON.parse(response.body)
      expect(json['invites']).to eq([])
    end
  end
end
