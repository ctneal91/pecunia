class CreateRecurringContributions < ActiveRecord::Migration[8.1]
  def change
    create_table :recurring_contributions do |t|
      t.references :goal, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :frequency, null: false
      t.datetime :next_occurrence_at, null: false
      t.datetime :end_date
      t.boolean :is_active, default: true, null: false
      t.text :note

      t.timestamps
    end

    add_index :recurring_contributions, :next_occurrence_at
    add_index :recurring_contributions, :is_active
  end
end
