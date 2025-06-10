class CreateLinkGenerators < ActiveRecord::Migration[7.0]
  def change
    create_table :link_generators do |t|
      t.references :linkable, polymorphic: true, null: false
      t.string :type, null: false # 'DirectLink' or 'ActivityLink'
      t.text :url, null: false # String for DirectLink, JSON for ActivityLink
      t.text :description
      t.json :metadata

      t.timestamps
    end

    add_index :link_generators, [:linkable_type, :linkable_id]
    add_index :link_generators, :type
  end
end