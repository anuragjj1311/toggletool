class CleanupDuplicateTabs < ActiveRecord::Migration[7.0]
  def up
    Toggle.find_each do |toggle|
      toggle.tabs.group_by { |tab| [tab.tab_type, tab.title] }.each do |(type, title), tabs|
        if tabs.size > 1
          sorted_tabs = tabs.sort_by(&:created_at).reverse
          
          tab_to_keep = sorted_tabs.first
          
          sorted_tabs[1..-1].each do |tab|
            tab.delete
          end
        end
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end 