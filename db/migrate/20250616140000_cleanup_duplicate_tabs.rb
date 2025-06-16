class CleanupDuplicateTabs < ActiveRecord::Migration[7.0]
  def up
    # Get all toggles
    Toggle.find_each do |toggle|
      # Group tabs by type and title
      toggle.tabs.group_by { |tab| [tab.tab_type, tab.title] }.each do |(type, title), tabs|
        # If we have duplicates (more than 1 tab with same type and title)
        if tabs.size > 1
          # Sort by created_at in descending order (most recent first)
          sorted_tabs = tabs.sort_by(&:created_at).reverse
          
          # Keep the most recent tab
          tab_to_keep = sorted_tabs.first
          
          # Delete the rest
          sorted_tabs[1..-1].each do |tab|
            # Use delete to bypass callbacks
            tab.delete
          end
        end
      end
    end
  end

  def down
    # This migration cannot be reversed
    raise ActiveRecord::IrreversibleMigration
  end
end 