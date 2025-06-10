class ToggleService
  class << self
    # Get active toggles for a tab by region (through associations)
    def active_toggles_for_tab(tab, region = nil)
      associations = tab.tab_toggle_associations.active
      associations = associations.by_region(region) if region.present?
      
      Toggle.joins(:tab_toggle_associations)
            .where(tab_toggle_associations: { id: associations.select(:id) })
            .includes(:link_generator)
            .active
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

    # Create association between tab and toggle
    def create_association(tab, toggle, options = {})
      association_data = {
        tab: tab,
        toggle: toggle,
        toggle_type: toggle.toggle_type,
        link_type: toggle.link_generator.type,
        start_date: options[:start_date] || toggle.start_date,
        end_date: options[:end_date] || toggle.end_date,
        regions: options[:regions] || tab.regions
      }
      
      TabToggleAssociation.create!(association_data)
    end

    # Update toggle association
    def update_association(tab, toggle, updates)
      association = tab.tab_toggle_associations.find_by(toggle: toggle)
      association&.update!(updates)
    end

    # Remove toggle from tab (delete association)
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

    # Sync toggle data with its associations
    def sync_toggle_associations(toggle)
      toggle.tab_toggle_associations.each do |association|
        association.update!(
          toggle_type: toggle.toggle_type,
          link_type: toggle.link_generator.type
        )
      end
    end
  end
end