class MembershipSerializer
  attr_reader :membership

  def initialize(membership)
    @membership = membership
  end

  def as_json
    {
      id: membership.id,
      user_id: membership.user_id,
      user_name: membership.user.name || membership.user.email.split("@").first,
      user_email: membership.user.email,
      role: membership.role,
      joined_at: membership.created_at
    }
  end
end
