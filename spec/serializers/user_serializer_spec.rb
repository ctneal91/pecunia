require "rails_helper"

RSpec.describe UserSerializer do
  describe "#as_json" do
    let(:user) do
      User.create!(
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        avatar_url: "https://example.com/avatar.jpg"
      )
    end

    subject { described_class.new(user).as_json }

    it "returns user id" do
      expect(subject[:id]).to eq(user.id)
    end

    it "returns user email" do
      expect(subject[:email]).to eq("test@example.com")
    end

    it "returns user name" do
      expect(subject[:name]).to eq("Test User")
    end

    it "returns user avatar_url" do
      expect(subject[:avatar_url]).to eq("https://example.com/avatar.jpg")
    end

    it "does not include password_digest" do
      expect(subject.keys).not_to include(:password_digest)
    end
  end
end
