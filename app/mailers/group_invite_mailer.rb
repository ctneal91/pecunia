class GroupInviteMailer < ApplicationMailer
  def invite(group_invite)
    @invite = group_invite
    @group = group_invite.group
    @inviter = group_invite.invited_by
    @accept_url = accept_invite_url(group_invite.token)

    mail(
      to: group_invite.email,
      subject: "#{@inviter.name || @inviter.email} invited you to join #{@group.name} on Pecunia"
    )
  end

  private

  def accept_invite_url(token)
    "#{root_url}invites/#{token}"
  end

  def root_url
    host = Rails.application.config.action_mailer.default_url_options[:host]
    protocol = Rails.application.config.action_mailer.default_url_options[:protocol] || "http"
    "#{protocol}://#{host}/"
  end
end
