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

ActiveRecord::Schema[8.1].define(version: 2025_12_29_202449) do
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
    t.bigint "group_id"
    t.string "icon"
    t.decimal "target_amount", precision: 15, scale: 2, null: false
    t.date "target_date"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["group_id"], name: "index_goals_on_group_id"
    t.index ["user_id"], name: "index_goals_on_user_id"
  end

  create_table "group_invites", force: :cascade do |t|
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.bigint "group_id", null: false
    t.bigint "invited_by_id", null: false
    t.string "status", default: "pending", null: false
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id", "email"], name: "index_group_invites_on_group_id_and_email", unique: true
    t.index ["group_id"], name: "index_group_invites_on_group_id"
    t.index ["invited_by_id"], name: "index_group_invites_on_invited_by_id"
    t.index ["token"], name: "index_group_invites_on_token", unique: true
  end

  create_table "groups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "created_by_id", null: false
    t.string "invite_code", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_groups_on_created_by_id"
    t.index ["invite_code"], name: "index_groups_on_invite_code", unique: true
  end

  create_table "memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "group_id", null: false
    t.string "role", default: "member", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["group_id"], name: "index_memberships_on_group_id"
    t.index ["user_id", "group_id"], name: "index_memberships_on_user_id_and_group_id", unique: true
    t.index ["user_id"], name: "index_memberships_on_user_id"
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
  add_foreign_key "goals", "groups"
  add_foreign_key "goals", "users"
  add_foreign_key "group_invites", "groups"
  add_foreign_key "group_invites", "users", column: "invited_by_id"
  add_foreign_key "groups", "users", column: "created_by_id"
  add_foreign_key "memberships", "groups"
  add_foreign_key "memberships", "users"
end
