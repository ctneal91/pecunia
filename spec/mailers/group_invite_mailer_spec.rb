require "rails_helper"

RSpec.describe GroupInviteMailer, type: :mailer do
  describe "invite" do
    let(:inviter) { create(:user, name: "John Doe", email: "john@example.com") }
    let(:group) { create(:group, name: "Family Budget", created_by: inviter) }
    let(:group_invite) do
      create(:group_invite,
        group: group,
        invited_by: inviter,
        email: "friend@example.com",
        token: "abc123token"
      )
    end
    let(:mail) { GroupInviteMailer.invite(group_invite) }

    it "renders the headers" do
      expect(mail.subject).to eq("John Doe invited you to join Family Budget on Pecunia")
      expect(mail.to).to eq(["friend@example.com"])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "renders the body with invite details" do
      expect(mail.body.encoded).to include("John Doe")
      expect(mail.body.encoded).to include("Family Budget")
      expect(mail.body.encoded).to include("abc123token")
    end

    context "when inviter has no name" do
      let(:inviter) { create(:user, name: nil, email: "john@example.com") }

      it "uses email in subject" do
        expect(mail.subject).to eq("john@example.com invited you to join Family Budget on Pecunia")
      end
    end
  end
end
