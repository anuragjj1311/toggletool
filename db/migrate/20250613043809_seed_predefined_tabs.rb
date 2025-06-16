class SeedPredefinedTabs < ActiveRecord::Migration[7.0]
  def up
    # Create predefined tabs that developers manage
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
      Tab.find_or_create_by(title: tab_data[:title]) do |tab|
        tab.start_date = tab_data[:start_date]
        tab.end_date = tab_data[:end_date]
        tab.regions = tab_data[:regions]
      end
    end
  end

  def down
    # Remove all predefined tabs
    Tab.where(title: ['Men', 'Women', 'Kids', 'Boys', 'Girls']).destroy_all
  end
end