# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_12_29_185940) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "contributions", force: :cascade do |t|
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.datetime "contributed_at", null: false
    t.datetime "created_at", null: false
    t.bigint "goal_id", null: false
    t.text "note"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["contributed_at"], name: "index_contributions_on_contributed_at"
    t.index ["goal_id"], name: "index_contributions_on_goal_id"
    t.index ["user_id"], name: "index_contributions_on_user_id"
  end

  create_table "goals", force: :cascade do |t|
    t.string "color"
    t.datetime "created_at", null: false
    t.decimal "current_amount", precision: 15, scale: 2, default: "0.0", null: false
    t.text "description"
    t.string "goal_type", null: false
    t.string "icon"
    t.decimal "target_amount", precision: 15, scale: 2, null: false
    t.date "target_date"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["user_id"], name: "index_goals_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name"
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "contributions", "goals"
  add_foreign_key "contributions", "users"
  add_foreign_key "goals", "users"
end
