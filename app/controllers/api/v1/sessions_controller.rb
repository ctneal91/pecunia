module Api
  module V1
    class SessionsController < ApplicationController
      def create
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
          log_in(user)
          render json: { user: UserSerializer.new(user).as_json }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        log_out
        head :no_content
      end
    end
  end
end
