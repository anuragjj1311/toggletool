class CreateTabs < ActiveRecord::Migration[7.0]
  def change
    create_table :tabs do |t|
      t.string :title, null: false
      t.text :description
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.text :regions # SQLite doesn't have native JSON, use text with serialization
      t.boolean :active, default: true
      t.integer :sort_order, default: 0

      t.timestamps
    end

    add_index :tabs, :title
    add_index :tabs, [:start_date, :end_date]
    add_index :tabs, :active
  end
end