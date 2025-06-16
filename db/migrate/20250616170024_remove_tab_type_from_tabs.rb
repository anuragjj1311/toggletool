class RemoveTabTypeFromTabs < ActiveRecord::Migration[7.2]
  def change
    remove_column :tabs, :tab_type, :string
  end
end
