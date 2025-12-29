class CreateGroupInvites < ActiveRecord::Migration[8.1]
  def change
    create_table :group_invites do |t|
      t.references :group, null: false, foreign_key: true
      t.string :email, null: false
      t.string :token, null: false
      t.references :invited_by, null: false, foreign_key: { to_table: :users }
      t.string :status, null: false, default: "pending"
      t.datetime :accepted_at

      t.timestamps
    end

    add_index :group_invites, :token, unique: true
    add_index :group_invites, [ :group_id, :email ], unique: true
  end
end
