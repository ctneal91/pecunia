module Authentication
  extend ActiveSupport::Concern

  included do
    helper_method :current_user, :logged_in? if respond_to?(:helper_method)
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def logged_in?
    current_user.present?
  end

  def authenticate_user!
    render json: { error: "You must be logged in" }, status: :unauthorized unless logged_in?
  end

  def log_in(user)
    session[:user_id] = user.id
  end

  def log_out
    session.delete(:user_id)
    @current_user = nil
  end
end
