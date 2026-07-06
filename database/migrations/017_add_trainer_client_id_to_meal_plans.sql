-- Update this line in your 017 file
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS trainer_client_id INT REFERENCES trainer_clients(id) ON DELETE CASCADE;