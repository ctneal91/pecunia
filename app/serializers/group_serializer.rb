class GroupSerializer
  attr_reader :group, :current_user

  def initialize(group, current_user: nil)
    @group = group
    @current_user = current_user
  end

  def as_json
    {
      id: group.id,
      name: group.name,
      invite_code: include_invite_code? ? group.invite_code : nil,
      member_count: group.memberships.count,
      goal_count: group.goals.count,
      is_admin: current_user ? group.admin?(current_user) : false,
      created_at: group.created_at,
      updated_at: group.updated_at
    }
  end

  def as_json_with_members
    as_json.merge(
      members: group.memberships.includes(:user).map do |membership|
        MembershipSerializer.new(membership).as_json
      end
    )
  end

  private

  def include_invite_code?
    current_user && group.admin?(current_user)
  end
end
