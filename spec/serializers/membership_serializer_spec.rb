require "rails_helper"

RSpec.describe MembershipSerializer do
  describe "#as_json" do
    let(:user) { create(:user, name: "John Doe", email: "john@example.com") }
    let(:group) { create(:group, created_by: user) }
    let(:membership) { group.memberships.find_by(user: user) }

    subject { described_class.new(membership).as_json }

    it "returns membership id" do
      expect(subject[:id]).to eq(membership.id)
    end

    it "returns user_id" do
      expect(subject[:user_id]).to eq(user.id)
    end

    it "returns user_name" do
      expect(subject[:user_name]).to eq("John Doe")
    end

    it "returns user_email" do
      expect(subject[:user_email]).to eq("john@example.com")
    end

    it "returns role" do
      expect(subject[:role]).to eq("admin")
    end

    it "returns joined_at" do
      expect(subject[:joined_at]).to be_present
    end

    context "when user has no name" do
      let(:user) { create(:user, name: nil, email: "anonymous@example.com") }

      it "uses email prefix as user_name" do
        expect(subject[:user_name]).to eq("anonymous")
      end
    end
  end
end
