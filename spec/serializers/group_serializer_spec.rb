require "rails_helper"

RSpec.describe GroupSerializer do
  let(:admin) { create(:user) }
  let(:member) { create(:user) }
  let(:group) { create(:group, name: "Family Budget", created_by: admin) }

  before do
    group.memberships.create!(user: member, role: "member")
  end

  describe "#as_json" do
    context "with current_user as admin" do
      subject { described_class.new(group, current_user: admin).as_json }

      it "returns group id" do
        expect(subject[:id]).to eq(group.id)
      end

      it "returns group name" do
        expect(subject[:name]).to eq("Family Budget")
      end

      it "returns invite_code for admin" do
        expect(subject[:invite_code]).to eq(group.invite_code)
      end

      it "returns member_count" do
        expect(subject[:member_count]).to eq(2)
      end

      it "returns goal_count" do
        expect(subject[:goal_count]).to eq(0)
      end

      it "returns is_admin as true" do
        expect(subject[:is_admin]).to be true
      end

      it "returns timestamps" do
        expect(subject[:created_at]).to be_present
        expect(subject[:updated_at]).to be_present
      end
    end

    context "with current_user as non-admin member" do
      subject { described_class.new(group, current_user: member).as_json }

      it "hides invite_code" do
        expect(subject[:invite_code]).to be_nil
      end

      it "returns is_admin as false" do
        expect(subject[:is_admin]).to be false
      end
    end

    context "without current_user" do
      subject { described_class.new(group).as_json }

      it "hides invite_code" do
        expect(subject[:invite_code]).to be_nil
      end

      it "returns is_admin as false" do
        expect(subject[:is_admin]).to be false
      end
    end
  end

  describe "#as_json_with_members" do
    subject { described_class.new(group, current_user: admin).as_json_with_members }

    it "includes all base attributes" do
      expect(subject[:id]).to eq(group.id)
      expect(subject[:name]).to eq("Family Budget")
    end

    it "includes members array" do
      expect(subject[:members]).to be_an(Array)
      expect(subject[:members].length).to eq(2)
    end

    it "serializes each member" do
      admin_member = subject[:members].find { |m| m[:user_id] == admin.id }
      expect(admin_member[:role]).to eq("admin")
    end
  end
end
