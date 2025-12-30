require 'rails_helper'

RSpec.describe GroupInvite, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:group) }
    it { is_expected.to belong_to(:invited_by).class_name("User") }
  end

  describe "validations" do
    subject { create(:group_invite) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_uniqueness_of(:token) }
    it { is_expected.to validate_inclusion_of(:status).in_array(GroupInvite::STATUSES) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive.scoped_to(:group_id).with_message("has already been invited to this group") }

    it "validates email format" do
      invite = build(:group_invite, email: "invalid")
      expect(invite).not_to be_valid
      expect(invite.errors[:email]).to include("is invalid")
    end
  end

  describe "callbacks" do
    it "generates token on create" do
      invite = build(:group_invite, token: nil)
      invite.save!
      expect(invite.token).to be_present
    end

    it "normalizes email on save" do
      invite = create(:group_invite, email: "  TEST@EXAMPLE.COM  ")
      expect(invite.email).to eq("test@example.com")
    end
  end

  describe "#pending?" do
    it "returns true when status is pending" do
      invite = build(:group_invite, status: "pending")
      expect(invite.pending?).to be true
    end

    it "returns false when status is not pending" do
      invite = build(:group_invite, status: "accepted")
      expect(invite.pending?).to be false
    end
  end

  describe "#expired?" do
    it "returns true when created more than 7 days ago" do
      invite = create(:group_invite)
      invite.update_column(:created_at, 8.days.ago)
      expect(invite.expired?).to be true
    end

    it "returns false when created within 7 days" do
      invite = create(:group_invite)
      expect(invite.expired?).to be false
    end
  end

  describe "#accept!" do
    let(:group) { create(:group) }
    let(:invite) { create(:group_invite, group: group) }
    let(:user) { create(:user) }

    it "adds user to group and updates status" do
      result = invite.accept!(user)

      expect(result).to be true
      expect(invite.reload.status).to eq("accepted")
      expect(invite.accepted_at).to be_present
      expect(group.member?(user)).to be true
    end

    it "returns false if invite is not pending" do
      invite.update!(status: "declined")
      result = invite.accept!(user)

      expect(result).to be false
      expect(group.member?(user)).to be false
    end

    it "returns false if user is already a member" do
      group.memberships.create!(user: user, role: "member")
      result = invite.accept!(user)

      expect(result).to be false
      expect(invite.reload.status).to eq("pending")
    end
  end

  describe "#decline!" do
    let(:invite) { create(:group_invite) }

    it "updates status to declined" do
      result = invite.decline!

      expect(result).to be_truthy
      expect(invite.reload.status).to eq("declined")
    end

    it "returns false if invite is not pending" do
      invite.update!(status: "accepted")
      result = invite.decline!

      expect(result).to be false
      expect(invite.reload.status).to eq("accepted")
    end
  end

  describe "scopes" do
    it ".pending returns only pending invites" do
      pending_invite = create(:group_invite, status: "pending")
      create(:group_invite, status: "accepted")

      expect(GroupInvite.pending).to eq([pending_invite])
    end
  end
end
