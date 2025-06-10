class ToggleService
  class << self
    # Create a new tab with toggles
    def create_tab_with_toggles(tab_params, toggles_data = [])
      ActiveRecord::Base.transaction do
        tab = Tab.create!(tab_params)
        
        toggles_data.each do |toggle_data|
          toggle = create_toggle_for_tab(tab, toggle_data)
          associate_toggle_with_tab(tab, toggle, toggle_data[:association] || {})
        end
        
        tab
      end
    end

    # Create a toggle and associate it with a tab
    def create_toggle_for_tab(tab, toggle_data)
      link_data = toggle_data.delete(:link_generator) || {}
      toggle = Toggle.create!(toggle_data)
      
      # Create link generator
      link_type = determine_link_type(link_data[:url])
      link_generator = "#{link_type.classify}".constantize.create!(
        linkable: toggle,
        url: link_data[:url],
        description: link_data[:description]
      )
      
      toggle
    end

    # Associate a toggle with a tab
    def associate_toggle_with_tab(tab, toggle, association_data = {})
      association_params = {
        tab: tab,
        toggle: toggle,
        toggle_type: toggle.toggle_type,
        link_type: toggle.link_generator.type,
        start_date: association_data[:start_date] || tab.start_date,
        end_date: association_data[:end_date] || tab.end_date,
        regions: association_data[:regions] || tab.regions
      }
      
      TabToggleAssociation.create!(association_params)
    end

    # Get active toggles for a tab by region
    def active_toggles_for_tab(tab, region = nil)
      associations = tab.tab_toggle_associations.active
      associations = associations.by_region(region) if region.present?
      
      associations.includes(:toggle => :link_generator).map(&:toggle)
    end

    # Get active tabs with their toggles
    def active_tabs_with_toggles(region = nil)
      tabs = Tab.active
      tabs = tabs.by_region(region) if region.present?
      
      tabs.includes(tab_toggle_associations: { toggle: :link_generator })
          .map do |tab|
        {
          tab: tab,
          toggles: active_toggles_for_tab(tab, region)
        }
      end
    end

    # Update toggle association dates
    def update_toggle_association(tab, toggle, new_dates)
      association = tab.tab_toggle_associations.find_by(toggle: toggle)
      association&.update!(new_dates)
    end

    # Soft delete a toggle from a specific tab
    def remove_toggle_from_tab(tab, toggle)
      association = tab.tab_toggle_associations.find_by(toggle: toggle)
      association&.destroy
    end

    # Get toggle statistics
    def toggle_statistics
      {
        total_tabs: Tab.count,
        active_tabs: Tab.active.count,
        total_toggles: Toggle.active.count,
        shop_toggles: Toggle.shops.active.count,
        category_toggles: Toggle.categories.active.count,
        total_associations: TabToggleAssociation.count,
        active_associations: TabToggleAssociation.active.count
      }
    end

    # Cleanup expired associations
    def cleanup_expired_associations
      expired_count = TabToggleAssociation.where('end_date < ?', Date.current).count
      TabToggleAssociation.where('end_date < ?', Date.current).destroy_all
      expired_count
    end

    # Duplicate a tab with all its toggles
    def duplicate_tab(original_tab, new_tab_params)
      ActiveRecord::Base.transaction do
        new_tab = Tab.create!(new_tab_params)
        
        original_tab.tab_toggle_associations.each do |association|
          new_association = association.dup
          new_association.tab = new_tab
          new_association.save!
        end
        
        new_tab
      end
    end

    # Bulk update toggle associations
    def bulk_update_associations(association_updates)
      ActiveRecord::Base.transaction do
        association_updates.each do |update_data|
          association = TabToggleAssociation.find(update_data[:id])
          association.update!(update_data.except(:id))
        end
      end
    end

    # Generate toggle URLs for a specific region
    def generate_toggle_urls(tab, region = nil)
      toggles = active_toggles_for_tab(tab, region)
      
      toggles.map do |toggle|
        {
          toggle_id: toggle.id,
          title: toggle.title,
          type: toggle.toggle_type,
          url: toggle.link_generator.generate_url,
          link_type: toggle.link_generator.link_type
        }
      end
    end

    private

    def determine_link_type(url)
      case url
      when String then 'direct_link'
      when Hash then 'activity_link'
      else raise ArgumentError, 'URL must be either String or Hash'
      end
    end
  end
end