class RemoveUnusedColumns < ActiveRecord::Migration[7.0]
  def up
    remove_column :link_generators, :description, :text
    remove_column :link_generators, :metadata, :json
    remove_column :tabs, :description, :text
  end

  def down
    add_column :link_generators, :description, :text
    add_column :link_generators, :metadata, :json

    add_column :tabs, :description, :text
  end
end 