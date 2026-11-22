# Macrology (MacroMate)

## Stack
TypeScript, Express, PostgreSQL, React

## Project Structure
- `services/auth-service/` - JWT authentication
- `services/food-service/` - food CRUD, custom foods, ownership checks
- `services/meal-service/` - meal logging
- `services/user-service/` - user profiles
- `services/chatbot-service/` - chatbot
- `frontend/` - React frontend
- `database/` - migrations and schema
- `shared/` - shared types/utilities

## Running the Project
- Start any service: `npm run dev` (run inside each service folder)
- Run migrations: `node migration.js` (run inside `database/`)

## Rules
- Always verify food ownership before any edit or delete operation
- Functional React components with hooks only
- Do NOT refactor code I didn't ask you to touch
- Ask before making architectural changes
- Explain what you're doing before making edits