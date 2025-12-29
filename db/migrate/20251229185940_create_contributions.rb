class CreateContributions < ActiveRecord::Migration[8.1]
  def change
    create_table :contributions do |t|
      t.references :goal, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.text :note
      t.datetime :contributed_at, null: false

      t.timestamps
    end

    add_index :contributions, :contributed_at
  end
end
