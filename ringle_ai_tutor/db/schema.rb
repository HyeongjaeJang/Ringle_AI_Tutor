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

ActiveRecord::Schema[8.0].define(version: 2025_09_14_030041) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "conversation_sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "session_id", null: false
    t.datetime "started_at", null: false
    t.datetime "ended_at"
    t.integer "status", default: 0, null: false
    t.jsonb "logs", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_conversation_sessions_on_session_id", unique: true
    t.index ["user_id"], name: "index_conversation_sessions_on_user_id"
  end

  create_table "coupons", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "kind"
    t.integer "remaining_uses"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_coupons_on_user_id"
  end

  create_table "membership_plans", force: :cascade do |t|
    t.string "name", null: false
    t.integer "duration_days", null: false
    t.string "features", default: [], null: false, array: true
    t.integer "price_cents", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "membership_plan_id", null: false
    t.integer "amount_cents", default: 0, null: false
    t.string "currency", default: "KRW", null: false
    t.string "provider", default: "mock", null: false
    t.string "provider_txn_id", null: false
    t.integer "status", default: 0, null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "issued_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["membership_plan_id"], name: "index_payments_on_membership_plan_id"
    t.index ["provider_txn_id"], name: "index_payments_on_provider_txn_id", unique: true
    t.index ["status"], name: "index_payments_on_status"
    t.index ["user_id"], name: "index_payments_on_user_id"
  end

  create_table "user_memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "membership_plan_id", null: false
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.integer "status"
    t.string "assigned_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["membership_plan_id"], name: "index_user_memberships_on_membership_plan_id"
    t.index ["user_id"], name: "index_user_memberships_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role", default: 0, null: false
    t.string "password_digest"
    t.index ["email"], name: "index_users_on_email"
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "conversation_sessions", "users"
  add_foreign_key "coupons", "users"
  add_foreign_key "payments", "membership_plans"
  add_foreign_key "payments", "users"
  add_foreign_key "user_memberships", "membership_plans"
  add_foreign_key "user_memberships", "users"
end
