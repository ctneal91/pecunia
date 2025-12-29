require 'rails_helper'

RSpec.describe 'Frontend', type: :request do
  describe 'GET /' do
    before do
      # Create a minimal index.html for testing
      File.write(Rails.public_path.join('index.html'), '<html><body>React App</body></html>')
    end

    after do
      File.delete(Rails.public_path.join('index.html')) if File.exist?(Rails.public_path.join('index.html'))
    end

    it 'returns success' do
      get '/'
      expect(response).to have_http_status(:ok)
    end

    it 'serves the React app' do
      get '/'
      expect(response.body).to include('React App')
    end
  end

  describe 'GET /any-path' do
    before do
      File.write(Rails.public_path.join('index.html'), '<html><body>React App</body></html>')
    end

    after do
      File.delete(Rails.public_path.join('index.html')) if File.exist?(Rails.public_path.join('index.html'))
    end

    it 'serves the React app for client-side routes' do
      get '/some/client/route'
      expect(response).to have_http_status(:ok)
      expect(response.body).to include('React App')
    end
  end
end
