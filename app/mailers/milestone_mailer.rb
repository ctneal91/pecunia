class MilestoneMailer < ApplicationMailer
  def achievement(user, goal, milestone_percentage)
    @user = user
    @goal = goal
    @milestone_percentage = milestone_percentage
    @goal_url = goal_url(goal.id)

    mail(
      to: user.email,
      subject: "🎉 Milestone Achieved! You reached #{milestone_percentage}% of your #{goal.title} goal"
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
end
