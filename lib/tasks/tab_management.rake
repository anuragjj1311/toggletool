namespace :tabs do
  desc "Recreate all predefined tabs"
  task recreate_all: :environment do
    puts "Recreating all predefined tabs..."
    
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
        regions: ['Haryana', 'Punjab', 'Rajusthan', 'Delhi']
      },
      {
        title: 'Home',
        start_date: Date.current,
        end_date: Date.current + 1.year,
        regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore']
      },
      {
        title: 'Beauty',
        start_date: Date.current,
        end_date: Date.current + 1.year,
        regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai']
      },
      {
        title: 'Electronics',
        start_date: Date.current,
        end_date: Date.current + 1.year,
        regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai']
      },
      {
        title: 'Sports',
        start_date: Date.current,
        end_date: Date.current + 1.year,
        regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi']
      },
      {
        title: 'Books',
        start_date: Date.current,
        end_date: Date.current + 1.year,
        regions: ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']
      }
    ]

    predefined_tabs.each do |tab_data|
      tab = Tab.find_or_initialize_by(title: tab_data[:title])
      if tab.persisted?
        puts "Tab '#{tab_data[:title]}' already exists (ID: #{tab.id})"
      else
        tab.assign_attributes(tab_data)
        if tab.save
          puts "Created tab '#{tab_data[:title]}' (ID: #{tab.id})"
        else
          puts "Failed to create tab '#{tab_data[:title]}': #{tab.errors.full_messages.join(', ')}"
        end
      end
    end
    
    puts "Finished recreating predefined tabs. Total tabs: #{Tab.count}"
  end

  desc "Recreate a specific missing tab"
  task :recreate, [:tab_name] => :environment do |task, args|
    tab_name = args[:tab_name]
    
    unless Tab::VALID_TAB_TYPES.include?(tab_name)
      puts "Invalid tab name. Valid tabs: #{Tab::VALID_TAB_TYPES.join(', ')}"
      exit
    end

    # Default configurations for each tab
    tab_configs = {
      'Men' => ['Haryana', 'Punjab', 'Rajasthan', 'Delhi'],
      'Women' => ['Haryana', 'Punjab', 'Rajasthan', 'Delhi'],
      'Kids' => ['Haryana', 'Punjab', 'Rajasthan', 'Delhi'],
      'Boys' => ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Bangalore'],
      'Girls' => ['Haryana', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai']
    }

    existing_tab = Tab.find_by(title: tab_name)
    if existing_tab
      puts "Tab '#{tab_name}' already exists (ID: #{existing_tab.id})"
      exit
    end

    tab = Tab.create!(
      title: tab_name,
      start_date: Date.current,
      end_date: Date.current + 1.year,
      regions: tab_configs[tab_name]
    )

    puts "Successfully created tab '#{tab_name}' (ID: #{tab.id})"
  end

  desc "List all tabs"
  task list: :environment do
    puts "All tabs:"
    Tab.all.each do |tab|
      puts "- #{tab.title} (ID: #{tab.id}) - Regions: #{tab.regions.join(', ')}"
    end
  end
end