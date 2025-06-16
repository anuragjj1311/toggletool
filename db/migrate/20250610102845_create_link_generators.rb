class CreateLinkGenerators < ActiveRecord::Migration[7.0]
  def change
    create_table :link_generators do |t|
      t.string :type, null: false 
      t.references :linkable, polymorphic: true, null: false
      t.text :url, null: false 
      t.timestamps
    end

    add_index :link_generators, :type
    add_index :link_generators, [:linkable_type, :linkable_id]
  end
end