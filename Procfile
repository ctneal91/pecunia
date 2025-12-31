web: bundle exec puma -C config/puma.rb
release: cd frontend && npm install && npm run build && cp -r build/* ../public/ && cd .. && bundle exec rails db:migrate
