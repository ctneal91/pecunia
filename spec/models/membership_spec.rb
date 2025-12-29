require 'rails_helper'

RSpec.describe Membership, type: :model do
  describe 'validations' do
    it 'requires a valid role' do
      membership = build(:membership, role: 'invalid')
      expect(membership).not_to be_valid
      expect(membership.errors[:role]).to include('is not included in the list')
    end

    it 'requires unique user per group' do
      group = create(:group)
      user = create(:user)
      create(:membership, group: group, user: user)
      duplicate = build(:membership, group: group, user: user)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to include('is already a member of this group')
    end
  end

  describe '#admin?' do
    it 'returns true for admin role' do
      membership = build(:membership, role: 'admin')
      expect(membership.admin?).to be true
    end

    it 'returns false for member role' do
      membership = build(:membership, role: 'member')
      expect(membership.admin?).to be false
    end
  end
end
