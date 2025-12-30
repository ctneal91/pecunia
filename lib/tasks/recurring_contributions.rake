namespace :recurring_contributions do
  desc "Process all due recurring contributions"
  task process: :environment do
    puts "Processing recurring contributions..."
    results = RecurringContributionProcessor.process_all
    puts "Processed: #{results[:processed]}, Created: #{results[:created]}"
  end
end
