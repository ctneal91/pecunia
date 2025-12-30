class CreateMilestones < ActiveRecord::Migration[8.1]
  def change
    create_table :milestones do |t|
      t.references :goal, null: false, foreign_key: true
      t.integer :percentage, null: false
      t.datetime :achieved_at, null: false

      t.timestamps
    end

    add_index :milestones, [ :goal_id, :percentage ], unique: true
  end
end
