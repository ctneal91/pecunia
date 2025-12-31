class ApplicationMailer < ActionMailer::Base
  default from: "from@example.com"
  layout "mailer"

  private

  STANDARD_HTTP_PORT = 80
  STANDARD_HTTPS_PORT = 443

  def base_url
    "#{protocol}://#{host_with_port}"
  end

  def host_with_port
    return host unless non_standard_port?

    "#{host}:#{port}"
  end

  def protocol
    url_options[:protocol] || "http"
  end

  def host
    url_options[:host]
  end

  def port
    url_options[:port]
  end

  def non_standard_port?
    port && port != STANDARD_HTTP_PORT && port != STANDARD_HTTPS_PORT
  end

  def url_options
    Rails.application.config.action_mailer.default_url_options
  end

  def goal_url(goal_id)
    "#{base_url}/goals/#{goal_id}"
  end

  def group_url(group_id)
    "#{base_url}/groups/#{group_id}"
  end
end
