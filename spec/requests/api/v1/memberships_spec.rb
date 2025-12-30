require 'rails_helper'

RSpec.describe 'Api::V1::Memberships', type: :request do
  let!(:admin) { create(:user) }
  let!(:member) { create(:user) }
  let!(:other_user) { create(:user) }
  let!(:group) { create(:group, created_by: admin) }

  before do
    group.memberships.create!(user: member, role: 'member')
  end

  def login_as(login_user)
    post '/api/v1/login', params: { email: login_user.email, password: 'password123' }
  end

  describe 'PATCH /api/v1/groups/:group_id/memberships/:id' do
    context 'as admin' do
      before { login_as(admin) }

      it 'updates member role' do
        membership = group.memberships.find_by(user: member)
        patch "/api/v1/groups/#{group.id}/memberships/#{membership.id}", params: { role: 'admin' }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['membership']['role']).to eq('admin')
      end

      it 'cannot change group creator role' do
        membership = group.memberships.find_by(user: admin)
        patch "/api/v1/groups/#{group.id}/memberships/#{membership.id}", params: { role: 'member' }
        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to include('group creator')
      end

      it 'returns not found for invalid membership' do
        patch "/api/v1/groups/#{group.id}/memberships/99999", params: { role: 'admin' }
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'as non-admin member' do
      before { login_as(member) }

      it 'returns forbidden' do
        membership = group.memberships.find_by(user: member)
        patch "/api/v1/groups/#{group.id}/memberships/#{membership.id}", params: { role: 'admin' }
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'as non-member' do
      before { login_as(other_user) }

      it 'returns not found' do
        membership = group.memberships.find_by(user: member)
        patch "/api/v1/groups/#{group.id}/memberships/#{membership.id}", params: { role: 'admin' }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /api/v1/groups/:group_id/memberships/:id' do
    context 'as admin' do
      before { login_as(admin) }

      it 'removes member from group' do
        membership = group.memberships.find_by(user: member)
        delete "/api/v1/groups/#{group.id}/memberships/#{membership.id}"
        expect(response).to have_http_status(:no_content)
        expect(group.member?(member)).to be false
      end

      it 'cannot remove group creator' do
        membership = group.memberships.find_by(user: admin)
        delete "/api/v1/groups/#{group.id}/memberships/#{membership.id}"
        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to include('group creator')
      end

      it 'returns not found for invalid membership' do
        delete "/api/v1/groups/#{group.id}/memberships/99999"
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'as non-admin member' do
      before { login_as(member) }

      it 'returns forbidden' do
        other_membership = group.memberships.find_by(user: admin)
        delete "/api/v1/groups/#{group.id}/memberships/#{other_membership.id}"
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE /api/v1/groups/:group_id/memberships/leave' do
    context 'as member' do
      before { login_as(member) }

      it 'leaves the group' do
        delete "/api/v1/groups/#{group.id}/memberships/leave"
        expect(response).to have_http_status(:no_content)
        expect(group.member?(member)).to be false
      end
    end

    context 'as group creator' do
      before { login_as(admin) }

      it 'returns forbidden' do
        delete "/api/v1/groups/#{group.id}/memberships/leave"
        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to include('creator cannot leave')
      end
    end

    context 'as non-member' do
      before { login_as(other_user) }

      it 'returns not found' do
        delete "/api/v1/groups/#{group.id}/memberships/leave"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
