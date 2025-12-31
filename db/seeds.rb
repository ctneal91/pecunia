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

# Create a second user
user2 = User.find_or_create_by!(email: "demo@example.com") do |u|
  u.password = "demo123"
  u.password_confirmation = "demo123"
  u.name = "Demo User"
end

puts "Created second user: #{user2.email}"

# Add more diverse goals for first user
if user.goals.count < 10
  car = user.goals.create!(
    title: "New Car Fund",
    description: "Saving for a reliable used car",
    target_amount: 12000,
    current_amount: 0,
    goal_type: "other",
    target_date: 8.months.from_now,
    color: "#607D8B"
  )

  # Add contributions to bring car fund to $8500
  car_contributions = [
    { amount: 2000, note: "Initial savings transfer", days_ago: 120 },
    { amount: 1000, note: nil, days_ago: 90 },
    { amount: 1500, note: "Sold old motorcycle", days_ago: 75 },
    { amount: 1000, note: nil, days_ago: 60 },
    { amount: 1000, note: nil, days_ago: 45 },
    { amount: 1000, note: nil, days_ago: 30 },
    { amount: 500, note: nil, days_ago: 15 },
    { amount: 500, note: nil, days_ago: 1 }
  ]

  car_contributions.each do |c|
    car.contributions.create!(
      user: user,
      amount: c[:amount],
      note: c[:note],
      contributed_at: c[:days_ago].days.ago
    )
  end

  education = user.goals.create!(
    title: "Professional Certification",
    description: "AWS Solutions Architect certification course and exam",
    target_amount: 1500,
    current_amount: 0,
    goal_type: "education",
    target_date: 2.months.ago,
    color: "#FF9800"
  )

  # Add contributions to complete education goal
  [
    { amount: 500, days_ago: 90 },
    { amount: 500, days_ago: 60 },
    { amount: 500, days_ago: 35 }
  ].each do |c|
    education.contributions.create!(
      user: user,
      amount: c[:amount],
      contributed_at: c[:days_ago].days.ago
    )
  end

  wedding = user.goals.create!(
    title: "Wedding Fund",
    description: "Saving for the big day",
    target_amount: 25000,
    current_amount: 0,
    goal_type: "other",
    target_date: 18.months.from_now,
    color: "#E91E63"
  )

  # Add contributions for wedding
  [
    { amount: 3000, note: "Family gift", days_ago: 150 },
    { amount: 2000, days_ago: 120 },
    { amount: 1500, days_ago: 90 },
    { amount: 1250, days_ago: 75 },
    { amount: 1000, days_ago: 60 },
    { amount: 1000, days_ago: 45 },
    { amount: 1000, days_ago: 30 },
    { amount: 1000, days_ago: 15 },
    { amount: 1000, days_ago: 5 }
  ].each do |c|
    wedding.contributions.create!(
      user: user,
      amount: c[:amount],
      note: c[:note],
      contributed_at: c[:days_ago].days.ago
    )
  end

  computer = user.goals.create!(
    title: "New Laptop",
    description: "MacBook Pro for development work",
    target_amount: 2500,
    current_amount: 0,
    goal_type: "other",
    target_date: 3.months.ago,
    color: "#9E9E9E"
  )

  # Add contributions to complete computer goal
  [
    { amount: 1000, days_ago: 120 },
    { amount: 750, days_ago: 90 },
    { amount: 750, days_ago: 65 }
  ].each do |c|
    computer.contributions.create!(
      user: user,
      amount: c[:amount],
      contributed_at: c[:days_ago].days.ago
    )
  end

  puts "Added 4 more goals for first user (2 completed, 2 in progress)"
end

# Create goals for second user
if user2.goals.empty?
  bike = user2.goals.create!(
    title: "Mountain Bike",
    description: "High-quality trail bike",
    target_amount: 1800,
    current_amount: 0,
    goal_type: "other",
    target_date: 5.months.from_now,
    color: "#8BC34A"
  )

  [
    { amount: 200, days_ago: 30 },
    { amount: 150, days_ago: 15 },
    { amount: 100, days_ago: 3 }
  ].each do |c|
    bike.contributions.create!(
      user: user2,
      amount: c[:amount],
      contributed_at: c[:days_ago].days.ago
    )
  end

  emergency = user2.goals.create!(
    title: "Emergency Savings",
    description: "3 months expenses",
    target_amount: 9000,
    current_amount: 0,
    goal_type: "emergency_fund",
    target_date: 18.months.from_now,
    color: "#4CAF50"
  )

  [
    { amount: 500, days_ago: 60 },
    { amount: 400, days_ago: 45 },
    { amount: 300, days_ago: 30 },
    { amount: 400, days_ago: 15 },
    { amount: 500, days_ago: 2 }
  ].each do |c|
    emergency.contributions.create!(
      user: user2,
      amount: c[:amount],
      contributed_at: c[:days_ago].days.ago
    )
  end

  puts "Created 2 goals for second user"
end

# Create a group with shared goals
if Group.count.zero?
  family_group = Group.create!(
    name: "Herman Family",
    created_by: user
  )

  # Creator is automatically added as admin by after_create callback
  family_group.memberships.create!(user: user2, role: "member")

  family_vacation = family_group.goals.create!(
    title: "Family Reunion Trip",
    description: "Annual family gathering in Colorado",
    target_amount: 8000,
    current_amount: 0,
    goal_type: "vacation",
    target_date: 10.months.from_now,
    color: "#00BCD4"
  )

  # Contributions from both users
  [
    { user: user, amount: 1000, note: "Starting the fund", days_ago: 60 },
    { user: user2, amount: 500, note: "Count me in!", days_ago: 55 },
    { user: user, amount: 800, days_ago: 40 },
    { user: user2, amount: 300, days_ago: 35 },
    { user: user, amount: 400, days_ago: 20 },
    { user: user2, amount: 200, days_ago: 10 }
  ].each do |c|
    family_vacation.contributions.create!(
      user: c[:user],
      amount: c[:amount],
      note: c[:note],
      contributed_at: c[:days_ago].days.ago
    )
  end

  home_renovation = family_group.goals.create!(
    title: "Kitchen Renovation",
    description: "Update kitchen appliances and countertops",
    target_amount: 15000,
    current_amount: 0,
    goal_type: "home",
    target_date: 1.year.from_now,
    color: "#795548"
  )

  [
    { user: user, amount: 2000, note: "Initial savings", days_ago: 90 },
    { user: user, amount: 1200, days_ago: 60 },
    { user: user2, amount: 800, days_ago: 50 },
    { user: user, amount: 1000, days_ago: 30 },
    { user: user2, amount: 400, days_ago: 10 }
  ].each do |c|
    home_renovation.contributions.create!(
      user: c[:user],
      amount: c[:amount],
      note: c[:note],
      contributed_at: c[:days_ago].days.ago
    )
  end

  puts "Created group 'Herman Family' with 2 members and 2 shared goals"
end

puts ""
puts "Seed complete!"
puts ""
puts "Login credentials:"
puts "  User 1 - Email: ctlnealherman@gmail.com, Password: app123"
puts "  User 2 - Email: demo@example.com, Password: demo123"
puts ""
puts "Summary:"
puts "  - #{User.count} users"
completed_goals = Goal.all.select(&:completed?).count
puts "  - #{Goal.count} total goals (#{completed_goals} completed)"
puts "  - #{Group.count} groups"
puts "  - #{Contribution.count} contributions"
