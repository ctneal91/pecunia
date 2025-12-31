class GroupActivityMailer < ApplicationMailer
  def new_contribution(member, contribution, goal)
    @member = member
    @contribution = contribution
    @goal = goal
    @contributor = contribution.user
    @group = goal.group
    @goal_url = goal_url(goal.id)

    mail(
      to: member.email,
      subject: "💰 New contribution to #{goal.title} in #{@group.name}"
    )
  end

  def new_member(existing_member, new_member, group)
    @existing_member = existing_member
    @new_member = new_member
    @group = group
    @group_url = group_url(group.id)

    mail(
      to: existing_member.email,
      subject: "👋 #{new_member.name || new_member.email.split('@').first.capitalize} joined #{group.name}"
    )
  end

  def goal_completed(member, goal)
    @member = member
    @goal = goal
    @group = goal.group
    @goal_url = goal_url(goal.id)

    mail(
      to: member.email,
      subject: "🎉 Group goal completed: #{goal.title} in #{@group.name}!"
    )
  end

  private

  def goal_url(goal_id)
    host = Rails.application.config.action_mailer.default_url_options[:host]
    port = Rails.application.config.action_mailer.default_url_options[:port]
    protocol = Rails.application.config.action_mailer.default_url_options[:protocol] || "http"

    base_url = if port && port != 80 && port != 443
      "#{protocol}://#{host}:#{port}"
    else
      "#{protocol}://#{host}"
    end

    "#{base_url}/goals/#{goal_id}"
  end

  def group_url(group_id)
    host = Rails.application.config.action_mailer.default_url_options[:host]
    port = Rails.application.config.action_mailer.default_url_options[:port]
    protocol = Rails.application.config.action_mailer.default_url_options[:protocol] || "http"

    base_url = if port && port != 80 && port != 443
      "#{protocol}://#{host}:#{port}"
    else
      "#{protocol}://#{host}"
    end

    "#{base_url}/groups/#{group_id}"
  end
end
