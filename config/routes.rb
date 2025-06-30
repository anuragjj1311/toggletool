Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'toggles/config', to: 'tabs#index'
      get 'tabs', to: 'tabs#all_tab_objects'
      resources :tabs, only: [:show]
      post   'toggles/tabs/:tab_id', to: 'toggles#create'
      patch 'toggles/:id/restore', to: 'toggles#restore'
      get 'available_options', to: 'toggles#available_options'
      resources :toggles, only: [:show, :update, :destroy]
      get 'configs', to: 'configs#index'
      post 'toggles/:id/tabs/:tab_id/associate', to: 'toggles#associate_tab'
      patch 'toggles/:id/tabs/:tab_id/association', to: 'toggles#update_association'
    end
  end
end