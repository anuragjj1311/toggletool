class RemoveImageUrlFromToggles < ActiveRecord::Migration[7.2]
  def change
    remove_column :toggles, :image_url, :string
  end
end
