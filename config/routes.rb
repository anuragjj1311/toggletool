Rails.application.routes.draw do
  # Web routes
  get 'toggles/new', to: 'toggles#new', as: :new_toggle
  get 'toggles/:id/edit', to: 'toggles#edit', as: :edit_toggle

  resources :toggles, except: [:new, :edit] do
    resources :tabs, only: [:new, :create, :edit, :update, :destroy], controller: 'tabs'
  end

  root 'home#index'

  # API routes
  namespace :api do
    namespace :v1 do
      resources :toggles do
        resources :tabs, only: [:create]
      end
      resources :tabs, only: [:index, :show, :update, :destroy]
    end
  end
end
