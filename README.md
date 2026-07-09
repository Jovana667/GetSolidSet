# Get Solid Set

A full-stack fitness coaching platform for personal trainers to build, manage, and share meal plans with clients.

## Overview

Get Solid Set is built for the trainer-client workflow — trainers create structured meal plans, assign them to clients, track body composition measurements, and share plans via a clean mobile-friendly link. Clients can view their assigned plans without needing to log in.

## Tech Stack

* Frontend: React, TypeScript, Tailwind CSS — deployed on Vercel
* Backend: Node.js, TypeScript, Express, PostgreSQL — deployed on Render
* Architecture: Microservices (auth, food, meal, user, chatbot)
* Auth: JWT with refresh tokens, OTP-based password reset via Gmail
* Email: Nodemailer (Gmail SMTP)

## Features

* Trainer and client account roles
* Meal plan builder with breakfast, lunch, dinner, and snack sections
* Food database with categories (protein, carbs, fats, vegetables, fruits, supplements)
* Custom food creation
* Macro calculations per food, per meal, and daily totals
* Client management — add, link, and view clients
* Skinfold measurement tracking
* Client notes and journal
* Shareable meal plan links (no client login required)
* PDF-ready meal plan view
* OTP-based forgot password flow
* Mobile responsive with food drawer for small screens

## Architecture

```
services/
  auth-service/     → JWT auth, registration, password reset (port 3001)
  food-service/      → Food database, custom foods (port 3002)
  meal-service/      → Meal plans, sharing, assignment (port 3003)
  user-service/      → Profiles, clients, skinfolds, notes (port 3004)
  chatbot-service/   → AI meal suggestions
frontend/            → React app
database/             → Migrations and seed data
```

## Getting Started

### Prerequisites

* Node.js v18+
* PostgreSQL 14+
* npm

### Database Setup

```
# Create database
createdb getsolidset_dev

# Run migrations
cd database
npm install
node migrate.js

# Seed food data
cd database/seeds
node seed.js
```

### Environment Variables

Create a `.env` in each service folder:

**Auth service (port 3001)**
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/getsolidset_dev
PORT=3001
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ALLOWED_ORIGINS=http://localhost:5173
```

**Food service (port 3002)**
```
DATABASE_URL=...
PORT=3002
```

**Meal service (port 3003)**
```
DATABASE_URL=...
PORT=3003
```

**User service (port 3004)**
```
DATABASE_URL=...
PORT=3004
```

Note: `EMAIL_PASS` must be a Gmail App Password (16 characters), not your regular Gmail password. Generate one at Google Account → Security → 2-Step Verification → App Passwords.

### Frontend

```
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```
VITE_AUTH_API_URL=http://localhost:3001/api/auth
VITE_MEAL_API_URL=http://localhost:3003
VITE_FOOD_API_URL=http://localhost:3002
VITE_USER_API_URL=http://localhost:3004
```

### Running Services

```
# Each service in its own terminal
cd services/auth-service && npm run dev
cd services/food-service && npm run dev
cd services/meal-service && npm run dev
cd services/user-service && npm run dev
```

## Adding Custom Foods

Edit `database/seeds/foods.json` directly — each entry follows this shape:

```
{
  "name": "Chicken breast",
  "category": "protein",
  "protein_per_100g": 31,
  "carbs_per_100g": 0,
  "fat_per_100g": 3.6,
  "calories_per_100g": 165,
  "default_serving_g": 150
}
```

Then re-run `node seed.js` — existing custom foods are preserved.

## Deployment

* Frontend: Vercel (auto-deploys from main)
* Backend: Render (Starter plan — always-on, outbound SMTP enabled)
* Database: Render PostgreSQL

## Status

🚀 Pilot launch — actively in use and development
