source "https://rubygems.org"

gem "rails", "~> 7.2.2", ">= 7.2.2.1"
gem "sqlite3", ">= 1.4"
gem "puma", ">= 5.0"
gem "tzinfo-data", platforms: %i[windows jruby]
gem "bootsnap", require: false
gem "rack-cors"

group :development, :test do
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"
  gem "rspec-rails"
  gem "rswag"
  gem "rswag-api"
  gem "rswag-ui"
  gem "rswag-specs"

  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end

gem "image_processing", "~> 1.14"
