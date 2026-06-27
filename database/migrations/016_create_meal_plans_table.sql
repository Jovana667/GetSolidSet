-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_template BOOLEAN DEFAULT TRUE,
    meal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add meal_plan_id to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);