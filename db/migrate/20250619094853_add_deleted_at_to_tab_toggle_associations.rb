class AddDeletedAtToTabToggleAssociations < ActiveRecord::Migration[7.2]
  def change
    add_column :tab_toggle_associations, :deleted_at, :datetime
    add_index :tab_toggle_associations, :deleted_at
  end
end
