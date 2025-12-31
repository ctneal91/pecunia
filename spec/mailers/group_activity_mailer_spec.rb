require 'rails_helper'

RSpec.describe GroupActivityMailer, type: :mailer do
  let(:group) { create(:group, name: 'Family Savings') }
  let(:member) { create(:user, email: 'member@example.com', name: 'Alice') }
  let(:contributor) { create(:user, email: 'contributor@example.com', name: 'Bob') }

  before do
    create(:membership, group: group, user: member)
  end

  describe '#new_contribution' do
    let(:goal) { create(:goal, group: group, title: 'Vacation Fund', target_amount: 5000, current_amount: 2000) }
    let(:contribution) { create(:contribution, goal: goal, user: contributor, amount: 500, note: 'For the beach house!') }
    let(:mail) { described_class.new_contribution(member, contribution, goal) }

    it 'renders the subject' do
      expect(mail.subject).to eq('💰 New contribution to Vacation Fund in Family Savings')
    end

    it 'sends to the correct email address' do
      expect(mail.to).to eq([ member.email ])
    end

    it 'sends from the default mailer address' do
      expect(mail.from).to eq([ 'from@example.com' ])
    end

    it 'includes the member name in the greeting' do
      expect(mail.body.encoded).to include('Alice')
    end

    it 'includes the contributor name' do
      expect(mail.body.encoded).to include('Bob')
    end

    it 'includes the contribution amount' do
      expect(mail.body.encoded).to include('$500')
    end

    it 'includes the contribution note' do
      expect(mail.body.encoded).to include('For the beach house!')
    end

    it 'includes the goal title' do
      expect(mail.body.encoded).to include('Vacation Fund')
    end

    it 'includes the group name' do
      expect(mail.body.encoded).to include('Family Savings')
    end

    it 'includes current progress' do
      expect(mail.body.encoded).to include('$500')
      expect(mail.body.encoded).to include('$5,000')
    end

    it 'includes a link to view the goal' do
      expect(mail.body.encoded).to include("/goals/#{goal.id}")
    end

    context 'when contribution has no note' do
      let(:contribution) { create(:contribution, goal: goal, user: contributor, amount: 500, note: nil) }

      it 'does not include note section' do
        expect(mail.body.encoded).not_to include('Note:')
      end
    end

    context 'when member has no name' do
      let(:member) { create(:user, email: 'member@example.com', name: nil) }

      it 'uses the email prefix in greeting' do
        expect(mail.body.encoded).to include('Member')
      end
    end
  end

  describe '#new_member' do
    let(:existing_member) { member }
    let(:new_member) { create(:user, email: 'newbie@example.com', name: 'Charlie') }
    let(:mail) { described_class.new_member(existing_member, new_member, group) }

    before do
      create(:membership, group: group, user: new_member)
    end

    it 'renders the subject' do
      expect(mail.subject).to eq('👋 Charlie joined Family Savings')
    end

    it 'sends to the correct email address' do
      expect(mail.to).to eq([ existing_member.email ])
    end

    it 'sends from the default mailer address' do
      expect(mail.from).to eq([ 'from@example.com' ])
    end

    it 'includes the existing member name in greeting' do
      expect(mail.body.encoded).to include('Alice')
    end

    it 'includes the new member name' do
      expect(mail.body.encoded).to include('Charlie')
    end

    it 'includes the new member email' do
      expect(mail.body.encoded).to include('newbie@example.com')
    end

    it 'includes the group name' do
      expect(mail.body.encoded).to include('Family Savings')
    end

    it 'includes member count' do
      expect(mail.body.encoded).to include('2')
    end

    it 'includes a link to view the group' do
      expect(mail.body.encoded).to include("/groups/#{group.id}")
    end

    context 'when new member has no name' do
      let(:new_member) { create(:user, email: 'newbie@example.com', name: nil) }

      it 'uses the email prefix in subject' do
        expect(mail.subject).to include('Newbie')
      end

      it 'uses the email prefix in body' do
        expect(mail.body.encoded).to include('Newbie')
      end
    end
  end

  describe '#goal_completed' do
    let(:goal) { create(:goal, :completed, group: group, title: 'Vacation Fund', target_amount: 5000, current_amount: 5000) }
    let(:mail) { described_class.goal_completed(member, goal) }

    before do
      create(:contribution, goal: goal, user: contributor, amount: 2500)
      create(:contribution, goal: goal, user: member, amount: 2500)
    end

    it 'renders the subject' do
      expect(mail.subject).to eq('🎉 Group goal completed: Vacation Fund in Family Savings!')
    end

    it 'sends to the correct email address' do
      expect(mail.to).to eq([ member.email ])
    end

    it 'sends from the default mailer address' do
      expect(mail.from).to eq([ 'from@example.com' ])
    end

    it 'includes the member name in greeting' do
      expect(mail.body.encoded).to include('Alice')
    end

    it 'includes the goal title' do
      expect(mail.body.encoded).to include('Vacation Fund')
    end

    it 'includes the group name' do
      expect(mail.body.encoded).to include('Family Savings')
    end

    it 'includes the target amount' do
      expect(mail.body.encoded).to include('$5,000')
    end

    it 'includes completion indicator' do
      expect(mail.body.encoded).to include('100%')
    end

    it 'includes contribution count' do
      expect(mail.body.encoded).to include('2')
    end

    it 'includes a link to view the goal' do
      expect(mail.body.encoded).to include("/goals/#{goal.id}")
    end

    context 'when goal has a description' do
      let(:goal) do
        create(:goal, :completed, group: group, title: 'Vacation Fund', description: 'Beach house rental', target_amount: 5000, current_amount: 5000)
      end

      it 'includes the description in the body' do
        expect(mail.body.encoded).to include('Beach house rental')
      end
    end
  end
end
