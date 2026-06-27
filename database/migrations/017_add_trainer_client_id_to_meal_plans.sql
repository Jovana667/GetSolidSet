ALTER TABLE meal_plans
ADD COLUMN trainer_client_id INTEGER REFERENCES trainer_clients(id) ON DELETE SET NULL;