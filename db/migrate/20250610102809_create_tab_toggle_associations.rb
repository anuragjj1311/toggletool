class CreateTabToggleAssociations < ActiveRecord::Migration[7.0]
  def change
    create_table :tab_toggle_associations do |t|
      t.references :tab, null: false, foreign_key: true
      t.references :toggle, null: false, foreign_key: true
      t.string :toggle_type, null: false
      t.string :link_type, null: false 
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.text :regions 

      t.timestamps
    end

    add_index :tab_toggle_associations, [:tab_id, :toggle_id], unique: true
    add_index :tab_toggle_associations, :toggle_type
    add_index :tab_toggle_associations, :link_type
    add_index :tab_toggle_associations, [:start_date, :end_date]
  end
end