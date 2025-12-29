# Pecunia

A financial goal tracking application that helps individuals and households collaboratively save toward shared financial goals. Built with Rails 8 API and React 19.

## Vision

Pecunia goes beyond traditional couples-focused financial apps to support diverse household configurations: roommates splitting expenses, multi-generational households, friend groups pooling resources, and more.

## Features

### Core Goal Tracking
| Feature | Status |
|---------|--------|
| Multiple goal types (emergency fund, down payment, debt payoff, retirement) | Planned |
| Progress visualization with React charts (Recharts/Victory) | Planned |
| Custom contribution schedules (weekly, biweekly, monthly, irregular) | Planned |
| Projection calculator with completion date estimates | Planned |
| Milestone celebrations at 25%/50%/75%/100% | Planned |

### Household/Shared Goals
| Feature | Status |
|---------|--------|
| Flexible households ("Smith Family", "Oak Street Roommates", etc.) | Planned |
| Membership roles (admin, contributor, viewer) | Planned |
| Individual vs. collective contribution tracking | Planned |
| Flexible splits (equal, proportional, custom percentages) | Planned |
| Real-time activity feed | Planned |
| Multiple household memberships per user | Planned |
| Privacy controls for goal visibility | Planned |

### API Integrations
| Integration | Purpose | Status |
|-------------|---------|--------|
| Plaid API | Auto-track bank account balances | Planned |
| Alpha Vantage/IEX Cloud | Investment account values | Planned |
| BLS/FRED API | Inflation data for long-term goals | Planned |
| Twilio | SMS notifications for milestones | Planned |

### Technical Architecture
| Component | Purpose | Status |
|-----------|---------|--------|
| Sidekiq | Background jobs for balance syncs, projections | Planned |
| PostgreSQL JSON columns | Flexible goal metadata | Planned |
| Action Cable | Real-time progress updates | Planned |
| Pundit | Authorization policies | Planned |
| Paper Trail | Contribution audit trail | Planned |
| Service objects | Clean calculation architecture | Planned |

### Data Model Overview
```
Users
  └── Memberships (role: admin/contributor/viewer)
        └── Households
              └── Goals (shared)
                    └── Contributions (who contributed what)

Users
  └── Goals (personal)
        └── Contributions
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rails 8 (API mode) |
| Frontend | React 19, TypeScript, Material UI |
| Database | PostgreSQL |
| Background Jobs | Sidekiq + Redis |
| Testing | RSpec, Jest, Cypress |
| Linting | RuboCop, ESLint |
| Deployment | Heroku |

## Prerequisites

- **Ruby 3.3+** - `ruby --version`
- **PostgreSQL** - `psql --version`
- **Node.js** - `node --version`
- **Redis** - For Sidekiq (production)
- **Heroku CLI** - `heroku --version`

## Getting Started

### Install Dependencies

```bash
# Ruby gems
bundle install

# Node packages
cd frontend && npm install && cd ..

# Root packages (husky/lint-staged)
npm install
```

### Setup Database

```bash
rails db:create db:migrate
```

### Run Locally

```bash
# Terminal 1 - Rails API (port 3000)
rails server -p 3000

# Terminal 2 - React dev server (port 3001)
cd frontend && npm start
```

Visit http://localhost:3001

## Deployment

### Heroku Setup

```bash
# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Add Redis (for Sidekiq)
heroku addons:create heroku-redis:mini

# Set master key
heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)

# Build and deploy
cd frontend && npm run build && cp -r build/* ../public/ && cd ..
git add .
git commit -m "Build frontend for production"
git push heroku master
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Heroku                        │
│  ┌───────────────────────────────────────────┐  │
│  │              Rails Server                 │  │
│  │  ┌─────────────────┐  ┌────────────────┐  │  │
│  │  │  API Routes     │  │  Static Files  │  │  │
│  │  │  /api/v1/*      │  │  public/*      │  │  │
│  │  │  (JSON)         │  │  (React build) │  │  │
│  │  └─────────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│         │                      │                │
│  ┌──────┴──────┐    ┌──────────┴──────────┐     │
│  │  PostgreSQL │    │  Redis + Sidekiq    │     │
│  └─────────────┘    └─────────────────────┘     │
└─────────────────────────────────────────────────┘
```

## Testing

```bash
# Rails tests
bundle exec rspec

# React tests
cd frontend && npm test

# Type checking
cd frontend && npm run typecheck
```

## License

MIT
