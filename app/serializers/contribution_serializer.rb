class ContributionSerializer
  attr_reader :contribution

  def initialize(contribution)
    @contribution = contribution
  end

  def as_json
    {
      id: contribution.id,
      goal_id: contribution.goal_id,
      user_id: contribution.user_id,
      amount: contribution.amount.to_f,
      note: contribution.note,
      contributed_at: contribution.contributed_at,
      created_at: contribution.created_at
    }
  end
end
