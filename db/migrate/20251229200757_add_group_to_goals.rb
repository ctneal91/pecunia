class AddGroupToGoals < ActiveRecord::Migration[8.1]
  def change
    add_reference :goals, :group, null: true, foreign_key: true
  end
end
