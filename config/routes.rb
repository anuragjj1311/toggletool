Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'available_options', to: 'toggles#available_options'

      # Custom route for tabs index at /api/v1/tabs/config
      get 'tabs/config', to: 'tabs#index'
      resources :tabs, only: [:index, :show, :update]

      # Nested routes for toggles within tabs (for specific tab context)
      resources :tabs, only: [:show, :update] do
        resources :toggles, except: [:destroy] do
          member do
            patch :restore    # /api/v1/tabs/:tab_id/toggles/:id/restore
            patch :reset      # /api/v1/tabs/:tab_id/toggles/:id/reset
          end
        end
        resources :category_toggles, path: 'categories'
        resources :shop_toggles, path: 'shops'
      end

      # Global toggle routes (for operations on all tabs)
      resources :toggles, only: [:show, :update, :destroy] do
        member do
          get :tabs_for_toggle, path: ''     # /api/v1/toggles/:id
          patch :restore                     # /api/v1/toggles/:id/restore (restores all)
          patch :reset                       # /api/v1/toggles/:id/reset (resets all)
        end
      end
      
      get 'configs', to: 'configs#index'
    end
  end
end