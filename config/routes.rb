Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'available_options', to: 'toggles#available_options'

      # Custom route for tabs index at /api/v1/tabs/config
      get 'tabs/config', to: 'tabs#index'
      resources :tabs, only: [:index, :show, :update]

      resources :tabs, only: [:show, :update] do
        resources :toggles, except: [:destroy]
        resources :category_toggles, path: 'categories'
        resources :shop_toggles, path: 'shops'
      end

      resources :toggles, only: [:show, :update, :destroy] do
        member do
          get :tabs_for_toggle, path: '' 
          patch :restore
          patch :reset
        end
      end
    end
  end
end