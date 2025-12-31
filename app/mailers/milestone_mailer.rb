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
end
