Rails.application.routes.draw do
  resource :session, only: %i[new create destroy]
  resource :registration, only: %i[new create]

  namespace :api do
    resources :tasks, only: %i[index create update destroy] do
      member do
        patch :complete
        patch :reopen
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

  root "tasks#index"
end
