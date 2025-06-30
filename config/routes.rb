Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'toggles/config', to: 'tabs#index'
      post   'toggles/tabs/:tab_id', to: 'toggles#create'
      patch 'toggles/:id/restore', to: 'toggles#restore'
      resources :toggles, only: [:show, :update, :destroy]
      post 'toggles/:id/tabs/:tab_id/associate', to: 'toggles#associate_tab'
      patch 'toggles/:id/tabs/:tab_id/association', to: 'toggles#update_association'
    end
  end
end