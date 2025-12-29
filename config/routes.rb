Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication
      post "signup", to: "registrations#create"
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"

      # Current user
      get "me", to: "users#me"
      patch "me", to: "users#update"

      # Dashboard
      get "dashboard", to: "dashboard#index"

      # Goals
      resources :goals, only: [ :index, :show, :create, :update, :destroy ] do
        collection do
          post :bulk_create
        end
        resources :contributions, only: [ :index, :create, :update, :destroy ]
      end

      # Groups
      resources :groups, only: [ :index, :show, :create, :update, :destroy ] do
        member do
          post :regenerate_invite
        end
        resources :memberships, only: [ :update, :destroy ] do
          collection do
            delete :leave
          end
        end
      end
      post "groups/join", to: "groups#join"
    end
  end

  # Catch-all route for React frontend (must be last)
  get "*path", to: "frontend#index", constraints: ->(req) { !req.path.start_with?("/api") }
  root "frontend#index"
end
