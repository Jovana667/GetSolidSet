-- Safely add the missing meal_date column if it isn't already there
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS meal_date DATE;