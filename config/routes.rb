Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :tabs do
        resources :toggles do
          member do
            patch :restore
            patch :reset
          end
        end
        
        resources :shop_toggles, only: [:create, :show, :update, :destroy] do
          member do
            patch :restore
            patch :reset
          end
        end
        
        resources :category_toggles, only: [:create, :show, :update, :destroy] do
          member do
            patch :restore
            patch :reset
          end
        end
      end
    end
  end
end