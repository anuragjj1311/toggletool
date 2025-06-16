class CreateTabs < ActiveRecord::Migration[7.0]
  def change
    create_table :tabs do |t|
      t.string :title, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.text :regions 

      t.timestamps
    end

    add_index :tabs, :title
    add_index :tabs, [:start_date, :end_date]
  end
end