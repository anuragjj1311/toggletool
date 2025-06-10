class CreateToggles < ActiveRecord::Migration[7.0]
  def change
    create_table :toggles do |t|
      t.string :title, null: false
      t.text :description
      t.string :toggle_type, null: false # 'Shop' or 'Category'
      t.string :image_url
      t.string :landing_url
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.boolean :active, default: true
      t.datetime :deleted_at
      t.integer :sort_order, default: 0

      t.timestamps
    end

    add_index :toggles, :title
    add_index :toggles, :toggle_type
    add_index :toggles, [:start_date, :end_date]
    add_index :toggles, :deleted_at
    add_index :toggles, :active
  end
end