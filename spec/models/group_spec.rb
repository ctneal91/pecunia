require 'rails_helper'

RSpec.describe Group, type: :model do
  describe 'validations' do
    it 'requires a name' do
      group = build(:group, name: nil)
      expect(group).not_to be_valid
      expect(group.errors[:name]).to include("can't be blank")
    end
  end

  describe 'callbacks' do
    it 'generates an invite code before validation on create' do
      group = build(:group)
      group.valid?
      expect(group.invite_code).to be_present
    end

    it 'adds creator as admin after create' do
      group = create(:group)
      expect(group.memberships.count).to eq(1)
      expect(group.memberships.first.user).to eq(group.created_by)
      expect(group.memberships.first.role).to eq('admin')
    end
  end

  describe '#admin?' do
    it 'returns true for admin users' do
      group = create(:group)
      expect(group.admin?(group.created_by)).to be true
    end

    it 'returns false for non-admin members' do
      group = create(:group)
      member = create(:user)
      group.memberships.create!(user: member, role: 'member')
      expect(group.admin?(member)).to be false
    end
  end

  describe '#member?' do
    it 'returns true for members' do
      group = create(:group)
      expect(group.member?(group.created_by)).to be true
    end

    it 'returns false for non-members' do
      group = create(:group)
      non_member = create(:user)
      expect(group.member?(non_member)).to be false
    end
  end

  describe '#regenerate_invite_code!' do
    it 'generates a new invite code' do
      group = create(:group)
      old_code = group.invite_code
      group.regenerate_invite_code!
      expect(group.invite_code).not_to eq(old_code)
    end
  end
end
