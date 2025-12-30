puts "Seeding database..."

user = User.find_or_create_by!(email: "ctlnealherman@gmail.com") do |u|
  u.password = "app123"
  u.password_confirmation = "app123"
  u.name = "Neal"
end

puts "Created user: #{user.email}"

if user.goals.empty?
  emergency_fund = user.goals.create!(
    title: "Emergency Fund",
    description: "6 months of living expenses for unexpected situations",
    target_amount: 15000,
    current_amount: 0,
    goal_type: "emergency_fund",
    target_date: 1.year.from_now,
    color: "#4CAF50"
  )

  vacation = user.goals.create!(
    title: "Hawaii Trip",
    description: "Anniversary vacation to Maui",
    target_amount: 5000,
    current_amount: 0,
    goal_type: "vacation",
    target_date: 6.months.from_now,
    color: "#00BCD4"
  )

  home = user.goals.create!(
    title: "House Down Payment",
    description: "20% down payment for first home",
    target_amount: 60000,
    current_amount: 0,
    goal_type: "home",
    target_date: 3.years.from_now,
    color: "#795548"
  )

  retirement = user.goals.create!(
    title: "Roth IRA 2024",
    description: "Max out Roth IRA contribution",
    target_amount: 7000,
    current_amount: 0,
    goal_type: "retirement",
    target_date: Date.new(2024, 12, 31),
    color: "#9C27B0"
  )

  debt = user.goals.create!(
    title: "Pay Off Credit Card",
    description: "Clear the remaining balance",
    target_amount: 3500,
    current_amount: 0,
    goal_type: "debt_payoff",
    target_date: 4.months.from_now,
    color: "#FF5722"
  )

  puts "Created 5 goals"

  contributions = [
    { goal: emergency_fund, amount: 500, note: "First deposit", days_ago: 45 },
    { goal: emergency_fund, amount: 500, note: "Monthly contribution", days_ago: 30 },
    { goal: emergency_fund, amount: 750, note: "Bonus from work", days_ago: 20 },
    { goal: emergency_fund, amount: 500, note: "Monthly contribution", days_ago: 15 },
    { goal: emergency_fund, amount: 500, note: nil, days_ago: 5 },

    { goal: vacation, amount: 300, note: "Starting the fund", days_ago: 40 },
    { goal: vacation, amount: 200, note: nil, days_ago: 25 },
    { goal: vacation, amount: 400, note: "Extra savings", days_ago: 12 },
    { goal: vacation, amount: 250, note: nil, days_ago: 3 },

    { goal: home, amount: 1000, note: "Initial deposit", days_ago: 60 },
    { goal: home, amount: 800, note: nil, days_ago: 45 },
    { goal: home, amount: 1200, note: "Tax refund", days_ago: 30 },
    { goal: home, amount: 800, note: nil, days_ago: 15 },
    { goal: home, amount: 1000, note: nil, days_ago: 2 },

    { goal: retirement, amount: 583, note: "January contribution", days_ago: 50 },
    { goal: retirement, amount: 583, note: "February contribution", days_ago: 35 },
    { goal: retirement, amount: 583, note: "March contribution", days_ago: 20 },
    { goal: retirement, amount: 583, note: nil, days_ago: 5 },

    { goal: debt, amount: 500, note: "First payment", days_ago: 35 },
    { goal: debt, amount: 400, note: nil, days_ago: 25 },
    { goal: debt, amount: 600, note: "Extra payment", days_ago: 15 },
    { goal: debt, amount: 450, note: nil, days_ago: 7 },
    { goal: debt, amount: 500, note: nil, days_ago: 1 }
  ]

  contributions.each do |c|
    c[:goal].contributions.create!(
      user: user,
      amount: c[:amount],
      note: c[:note],
      contributed_at: c[:days_ago].days.ago
    )
  end

  puts "Created #{contributions.count} contributions"
end

puts "Seed complete!"
puts ""
puts "Login with:"
puts "  Email: ctlnealherman@gmail.com"
puts "  Password: app123"
