# Get Solid Set

A full-stack fitness coaching platform for personal trainers to build, manage, and share meal plans with clients.

**Live site:** [getsolidset.com](https://getsolidset.com) · **Status:** 🛠️ In active development, preparing for a pilot with personal trainers

<img width="353" height="786" alt="Screenshot 2026-11-23 025108" src="https://github.com/user-attachments/assets/8304cdca-c7f7-425e-bb13-e16cb7a9e917" />

<img width="353" height="786" alt="Screenshot 2026-11-23 025306" src="https://github.com/user-attachments/assets/de05242e-383c-4144-9edf-06608bd539d4" />

## Overview

Get Solid Set is built around the trainer–client workflow. Trainers create structured meal plans, assign them to clients, track body composition, and share plans through a clean, mobile-friendly link. Clients don't need an account to view a shared plan, so trainers can use the app without having to onboard every client.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS (deployed on Vercel)
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (deployed on Render)
- **Architecture:** Microservices (auth, food, meal, user)
- **Auth:** JWT access tokens with database-stored refresh tokens, OTP-based password reset
- **Email:** Nodemailer via Gmail SMTP

## Features

- Meal plan builder with macro totals per food, per meal, and per day
- Food database by category, plus trainer-created custom foods
- Client management: add, link, and view clients
- Skinfold measurement tracking and client notes
- Shareable meal plan links (no client login required)
- Mobile-first design, including a slide-out food drawer on small screens

## Technical Highlights

- **Microservices with shared JWT auth:** the auth service signs tokens, and each service verifies them independently with its own middleware.
- **Refresh token flow:** short-lived access tokens are refreshed automatically by the frontend, and refresh tokens are stored in and revoked from the database.
- **Ownership checks:** users can only read or modify their own clients, meal plans, and custom foods.
- **Fail-fast configuration:** services refuse to run without a `JWT_SECRET` instead of falling back to an insecure default.

## Architecture

```
services/
  auth-service/     → Registration, login, refresh tokens, password reset  (port 3001)
  food-service/     → Food database, custom foods                          (port 3002)
  meal-service/     → Meal plans, sharing, assignment                      (port 3003)
  user-service/     → Profiles, clients, skinfolds, notes                  (port 3004)
  chatbot-service/  → Planned: AI meal suggestions (not yet implemented)
frontend/           → React app
database/           → Schema, migrations, and seed data
```

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Environment variables

Create a `.env` file in each service folder. `JWT_SECRET` **must be identical in all four services**, otherwise tokens issued by the auth service will be rejected with `401 Invalid token`.

Generate a secret with:

```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**auth-service**
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/getsolidset_dev
PORT=3001
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**food-service**, **meal-service**, **user-service** (same shape, different port)
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/getsolidset_dev
PORT=3002   # 3003 for meal-service, 3004 for user-service
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173
```

> `EMAIL_PASS` must be a Gmail [App Password](https://myaccount.google.com/apppasswords), not your regular Gmail password.

**frontend** (`frontend/.env`)
```
VITE_AUTH_API_URL=http://localhost:3001/api/auth
VITE_FOOD_API_URL=http://localhost:3002/api
VITE_MEAL_API_URL=http://localhost:3003/api
VITE_USER_API_URL=http://localhost:3004/api
```

### 2. Database

Migrations and seeds read `DATABASE_URL` from `services/auth-service/.env`, so set that up first.

```
createdb getsolidset_dev

cd database
npm install
node migrate.js          # create tables
node seeds/seed.js       # load the food database
```

To update the food database, edit `database/seeds/foods.json` and re-run `node seeds/seed.js`. Trainer-created custom foods are preserved.

### 3. Run the app

Each service and the frontend run in their own terminal:

```
cd services/auth-service && npm install && npm run dev
cd services/food-service && npm install && npm run dev
cd services/meal-service && npm install && npm run dev
cd services/user-service && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Deployment

- **Frontend:** Vercel, auto-deploys from `main`
- **Backend services and database:** Render
