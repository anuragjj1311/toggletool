class MoveLinkGeneratorToTabToggleAssociation < ActiveRecord::Migration[7.1]
  def up
    # Define models for migration
    # Ensure that these models are self-contained and don't depend on application code
    Object.const_set('Toggle', Class.new(ApplicationRecord)) unless defined?(Toggle)
    Toggle.table_name = 'toggles'
    Toggle.has_one :link_generator, as: :linkable, dependent: :destroy

    Object.const_set('TabToggleAssociation', Class.new(ApplicationRecord)) unless defined?(TabToggleAssociation)
    TabToggleAssociation.table_name = 'tab_toggle_associations'
    TabToggleAssociation.belongs_to :linked_toggle, class_name: 'Toggle', foreign_key: 'toggle_id'
    TabToggleAssociation.has_one :link_generator, as: :linkable, dependent: :destroy

    Object.const_set('LinkGenerator', Class.new(ApplicationRecord)) unless defined?(LinkGenerator)
    LinkGenerator.table_name = 'link_generators'
    LinkGenerator.belongs_to :linkable, polymorphic: true

    # Create new link generators for each association and copy data
    TabToggleAssociation.includes(linked_toggle: :link_generator).find_each do |association|
      original_link_generator = association.linked_toggle.link_generator
      if original_link_generator
        new_link_generator = LinkGenerator.new(
          type: original_link_generator.type,
          url: original_link_generator.url,
          linkable: association
        )
        unless new_link_generator.save
          puts "Failed to save new link_generator for association #{association.id}: #{new_link_generator.errors.full_messages.join(', ')}"
        end
      end
    end

    # Clean up old link generators tied to Toggles
    LinkGenerator.where(linkable_type: 'Toggle').destroy_all
  end

  def down

    
    Object.const_set('LinkGenerator', Class.new(ApplicationRecord)) unless defined?(LinkGenerator)
    LinkGenerator.table_name = 'link_generators'

    LinkGenerator.where(linkable_type: 'TabToggleAssociation').destroy_all
  end
end
