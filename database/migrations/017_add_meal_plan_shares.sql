CREATE TABLE IF NOT EXISTS meal_plan_shares (
  id            SERIAL PRIMARY KEY,
  meal_plan_id  INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  token         VARCHAR(64) NOT NULL UNIQUE,
  created_by    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP  -- NULL = never expires
);
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_token ON meal_plan_shares(token);
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_plan  ON meal_plan_shares(meal_plan_id);