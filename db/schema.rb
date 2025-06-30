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

ActiveRecord::Schema[7.2].define(version: 2025_06_29_054534) do
  create_table "link_generators", force: :cascade do |t|
    t.string "type", null: false
    t.string "linkable_type", null: false
    t.integer "linkable_id", null: false
    t.text "url", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["linkable_type", "linkable_id"], name: "index_link_generators_on_linkable"
    t.index ["linkable_type", "linkable_id"], name: "index_link_generators_on_linkable_type_and_linkable_id"
    t.index ["type"], name: "index_link_generators_on_type"
  end

  create_table "tab_toggle_associations", force: :cascade do |t|
    t.integer "tab_id", null: false
    t.integer "toggle_id", null: false
    t.string "toggle_type", null: false
    t.string "link_type", null: false
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.text "regions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.string "image_url"
    t.index ["deleted_at"], name: "index_tab_toggle_associations_on_deleted_at"
    t.index ["link_type"], name: "index_tab_toggle_associations_on_link_type"
    t.index ["start_date", "end_date"], name: "index_tab_toggle_associations_on_start_date_and_end_date"
    t.index ["tab_id", "toggle_id"], name: "index_tab_toggle_associations_on_tab_id_and_toggle_id", unique: true
    t.index ["tab_id"], name: "index_tab_toggle_associations_on_tab_id"
    t.index ["toggle_id"], name: "index_tab_toggle_associations_on_toggle_id"
    t.index ["toggle_type"], name: "index_tab_toggle_associations_on_toggle_type"
  end

  create_table "tabs", force: :cascade do |t|
    t.string "title"
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.text "regions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["start_date", "end_date"], name: "index_tabs_on_start_date_and_end_date"
    t.index ["title"], name: "index_tabs_on_title"
  end

  create_table "toggles", force: :cascade do |t|
    t.string "title", null: false
    t.string "toggle_type", null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_toggles_on_deleted_at"
    t.index ["title"], name: "index_toggles_on_title"
    t.index ["toggle_type"], name: "index_toggles_on_toggle_type"
  end

  add_foreign_key "tab_toggle_associations", "tabs"
  add_foreign_key "tab_toggle_associations", "toggles"
end
