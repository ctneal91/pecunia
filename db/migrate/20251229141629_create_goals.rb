class CreateGoals < ActiveRecord::Migration[8.1]
  def change
    create_table :goals do |t|
      t.references :user, null: true, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.decimal :target_amount, precision: 15, scale: 2, null: false
      t.decimal :current_amount, precision: 15, scale: 2, default: 0, null: false
      t.string :goal_type, null: false
      t.date :target_date
      t.string :icon
      t.string :color

      t.timestamps
    end
  end
end
