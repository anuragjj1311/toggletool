class ToggleQueryService
  def initialize(region: nil, toggle_type: nil, link_type: nil)
    @region = region
    @toggle_type = toggle_type
    @link_type = link_type
  end

  def active_tabs_with_filtered_toggles
    tabs = Tab.active
    tabs = tabs.by_region(@region) if @region.present?

    tabs.includes(tab_toggle_associations: { toggle: :link_generator })
        .map { |tab| filter_tab_toggles(tab) }
        .compact
  end

  def toggles_by_criteria
    associations = TabToggleAssociation.active.includes(:toggle, :tab)
    associations = associations.by_region(@region) if @region.present?
    associations = associations.by_toggle_type(@toggle_type) if @toggle_type.present?
    associations = associations.by_link_type(@link_type) if @link_type.present?

    associations.map(&:toggle).uniq
  end

  def performance_metrics
    {
      average_toggles_per_tab: calculate_average_toggles_per_tab,
      most_popular_toggle_type: most_popular_toggle_type,
      region_distribution: region_toggle_distribution,
      link_type_distribution: link_type_distribution
    }
  end

  private

  def filter_tab_toggles(tab)
    filtered_associations = tab.tab_toggle_associations.active
    filtered_associations = filtered_associations.by_region(@region) if @region.present?
    filtered_associations = filtered_associations.by_toggle_type(@toggle_type) if @toggle_type.present?
    filtered_associations = filtered_associations.by_link_type(@link_type) if @link_type.present?

    return nil if filtered_associations.empty?

    {
      tab: tab,
      toggles: filtered_associations.includes(toggle: :link_generator).map(&:toggle)
    }
  end

  def calculate_average_toggles_per_tab
    total_associations = TabToggleAssociation.active.count
    total_tabs = Tab.active.count
    return 0 if total_tabs.zero?
    
    (total_associations.to_f / total_tabs).round(2)
  end

  def most_popular_toggle_type
    TabToggleAssociation.active
                       .group(:toggle_type)
                       .count
                       .max_by { |_, count| count }
                       &.first
  end

  def region_toggle_distribution
    # This would need to be adapted based on your JSON region structure
    TabToggleAssociation.active
                       .where.not(regions: nil)
                       .group_by { |assoc| assoc.regions }
                       .transform_values(&:count)
  end

  def link_type_distribution
    TabToggleAssociation.active
                       .group(:link_type)
                       .count
  end
end