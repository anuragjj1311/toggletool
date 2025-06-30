class AddImageUrlToTabToggleAssociations < ActiveRecord::Migration[7.2]
  def change
    add_column :tab_toggle_associations, :image_url, :string
  end
end
