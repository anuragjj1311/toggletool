class AddTabTypeToTabs < ActiveRecord::Migration[7.2]
  def change
    add_column :tabs, :tab_type, :string
  end
end
