# Clear existing data
TabToggleAssociation.destroy_all
Toggle.destroy_all
Tab.destroy_all

predefined_tabs = [
  {
    title: 'Men',
    start_date: Date.current,
    end_date: Date.current + 1.year,
    regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi']
  },
  {
    title: 'Women',
    start_date: Date.current,
    end_date: Date.current + 1.year,
    regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi']
  },
  {
    title: 'Kids',
    start_date: Date.current,
    end_date: Date.current + 1.year,
    regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi']
  },
  {
    title: 'Boys',
    start_date: Date.current,
    end_date: Date.current + 1.year,
    regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore']
  },
  {
    title: 'Girls',
    start_date: Date.current,
    end_date: Date.current + 1.year,
    regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai']
  }
]

predefined_tabs.each do |tab_data|
  Tab.create!(
    title: tab_data[:title],
    start_date: tab_data[:start_date],
    end_date: tab_data[:end_date],
    regions: tab_data[:regions]
  )
end

puts "Seeded #{Tab.count} predefined tabs"

# Create some initial toggles
toggles = [
  { title: 'Summer Sale', toggle_type: 'SHOP', image_url: 'https://example.com/summer.jpg' },
  { title: 'New Arrivals', toggle_type: 'CATEGORY', image_url: 'https://example.com/new.jpg' }
]

toggles.each do |toggle_attrs|
  toggle = Toggle.create!(toggle_attrs)
  DirectLink.create!(
    linkable: toggle,
    url: { 'default' => 'https://example.com' }
  )
end

# Associate toggles with tabs
Tab.find_each do |tab|
  Toggle.find_each do |toggle|
    TabToggleAssociation.create!(
      tab: tab,
      linked_toggle: toggle,
      toggle_type: toggle.toggle_type,
      link_type: 'DIRECT',
      start_date: Date.today,
      end_date: Date.today + 1.year,
      regions: tab.regions
    )
  end
end

puts "Created #{Toggle.count} toggles and #{TabToggleAssociation.count} associations"