class CreateToggles < ActiveRecord::Migration[7.0]
  def change
    create_table :toggles do |t|
      t.string :title, null: false
      t.string :toggle_type, null: false 
      t.string :image_url
      t.datetime :deleted_at

      t.timestamps
    end

    add_index :toggles, :title
    add_index :toggles, :toggle_type
    add_index :toggles, :deleted_at
  end
end