Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      post "auth/signup", to: "auth#signup"
      post "auth/login",  to: "auth#login"


      namespace :me do
        get "memberships/current", to: "memberships#current"
        get "coupons",             to: "coupons#index"
      end

      resources :payments, only: [] do
        collection { post :mock_charge }
      end

      resources :conversation_sessions, only: [:create, :update] do
        member do
          post :end_session
        end
      end
      resources :membership_plans, only: [:index, :show]

      namespace :admin do
        resources :membership_plans, only: [:index, :create, :update, :destroy]
        resources :users, only: [] do
          resources :memberships, only: [:create, :destroy]
          resources :coupons,     only: [:create]
        end
        post "coupons/by_email", to: "coupons#by_email"
        post "payments/mock_charge", to: "payments#mock_charge"
      end
    end
  end
end
