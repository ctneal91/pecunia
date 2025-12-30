# Preview all emails at http://localhost:3000/rails/mailers/group_invite_mailer
class GroupInviteMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/group_invite_mailer/invite
  def invite
    GroupInviteMailer.invite
  end
end
