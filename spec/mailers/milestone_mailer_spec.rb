require 'rails_helper'

RSpec.describe MilestoneMailer, type: :mailer do
  describe '#achievement' do
    let(:user) { create(:user, email: 'john@example.com', name: 'John Doe') }
    let(:goal) { create(:goal, :with_user, user: user, title: 'Emergency Fund', target_amount: 10000, current_amount: 5000) }
    let(:milestone_percentage) { 50 }
    let(:mail) { described_class.achievement(user, goal, milestone_percentage) }

    it 'renders the subject' do
      expect(mail.subject).to eq('🎉 Milestone Achieved! You reached 50% of your Emergency Fund goal')
    end

    it 'sends to the correct email address' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'sends from the default mailer address' do
      expect(mail.from).to eq([ 'from@example.com' ])
    end

    it 'includes the goal title in the body' do
      expect(mail.body.encoded).to include('Emergency Fund')
    end

    it 'includes the milestone percentage in the body' do
      expect(mail.body.encoded).to include('50%')
    end

    it 'includes the user name in the greeting' do
      expect(mail.body.encoded).to include('John')
    end

    it 'includes current progress in the body' do
      expect(mail.body.encoded).to include('$5,000')
      expect(mail.body.encoded).to include('$10,000')
    end

    it 'includes a link to view the goal' do
      expect(mail.body.encoded).to include("/goals/#{goal.id}")
    end

    context 'when user has no name' do
      let(:user) { create(:user, email: 'john@example.com', name: nil) }

      it 'uses the email prefix in greeting' do
        expect(mail.body.encoded).to include('John')
      end
    end

    context 'when goal has a description' do
      let(:goal) do
        create(:goal, :with_user, user: user, title: 'Emergency Fund', description: 'For unexpected expenses', target_amount: 10000, current_amount: 5000)
      end

      it 'includes the description in the body' do
        expect(mail.body.encoded).to include('For unexpected expenses')
      end
    end

    context 'for 25% milestone' do
      let(:milestone_percentage) { 25 }

      it 'renders the correct percentage' do
        expect(mail.subject).to include('25%')
        expect(mail.body.encoded).to include('25%')
      end
    end

    context 'for 100% milestone' do
      let(:goal) { create(:goal, :completed, :with_user, user: user, title: 'Vacation Fund') }
      let(:milestone_percentage) { 100 }

      it 'celebrates goal completion' do
        expect(mail.subject).to include('100%')
        expect(mail.body.encoded).to include('100%')
      end
    end
  end
end
