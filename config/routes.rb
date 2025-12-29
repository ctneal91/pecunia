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
    end
  end

  # Catch-all route for React frontend (must be last)
  get "*path", to: "frontend#index", constraints: ->(req) { !req.path.start_with?("/api") }
  root "frontend#index"
end
