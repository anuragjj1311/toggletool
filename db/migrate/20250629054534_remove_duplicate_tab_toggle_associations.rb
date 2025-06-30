class RemoveDuplicateTabToggleAssociations < ActiveRecord::Migration[7.0]
  def up
    # Find and remove duplicate associations
    # Keep the most recent one for each tab_id and toggle_id combination
    duplicates = TabToggleAssociation.group(:tab_id, :toggle_id)
                                   .having('COUNT(*) > 1')
                                   .pluck(:tab_id, :toggle_id)
    
    duplicates.each do |tab_id, toggle_id|
      # Get all associations for this tab-toggle combination
      associations = TabToggleAssociation.where(tab_id: tab_id, toggle_id: toggle_id)
                                        .order(created_at: :desc)
      
      # Keep the most recent one, delete the rest
      associations.offset(1).destroy_all
    end
    
    puts "Removed duplicate associations for #{duplicates.count} tab-toggle combinations"
  end

  def down
    # This migration cannot be safely reversed
    # as we don't have the original duplicate data
    raise ActiveRecord::IrreversibleMigration
  end
end
