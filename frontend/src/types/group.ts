export interface Group {
  id: number;
  name: string;
  invite_code: string | null;
  member_count: number;
  goal_count: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupWithMembers extends Group {
  members: Membership[];
}

export interface Membership {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GroupInput {
  name: string;
}
