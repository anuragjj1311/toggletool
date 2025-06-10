class CreateTabToggleAssociations < ActiveRecord::Migration[7.0]
  def change
    create_table :tab_toggle_associations do |t|
      t.references :tab, null: false, foreign_key: true
      t.references :toggle, null: false, foreign_key: true
      t.string :toggle_type, null: false # 'Shop' or 'Category'
      t.string :link_type, null: false # 'DirectLink' or 'ActivityLink'
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.json :regions
      t.boolean :active, default: true
      t.integer :sort_order, default: 0

      t.timestamps
    end

    add_index :tab_toggle_associations, [:tab_id, :toggle_id], unique: true
    add_index :tab_toggle_associations, :toggle_type
    add_index :tab_toggle_associations, :link_type
    add_index :tab_toggle_associations, [:start_date, :end_date]
    add_index :tab_toggle_associations, :active
  end
end