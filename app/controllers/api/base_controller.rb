module Api
  class BaseController < ApplicationController
    rescue_from ActiveRecord::RecordNotFound do
      render json: { error: "Not found" }, status: :not_found
    end

    private
      def request_authentication
        render json: { error: "Not signed in" }, status: :unauthorized
      end
  end
end
