class MakeTitleNullableInTabs < ActiveRecord::Migration[7.2]
  def change
    change_column_null :tabs, :title, true
  end
end 