-- 1. Remove the redundant meal_date column from the meals table entirely
ALTER TABLE meals DROP COLUMN meal_date;

-- 2. Add the soft-delete flag to the foods table (defaults to true for all existing foods)
ALTER TABLE foods ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- 3. Safely break down the old strict unique constraint
ALTER TABLE foods DROP CONSTRAINT foods_name_unique;

-- 4. Rebuild it as an intelligent partial unique index
CREATE UNIQUE INDEX foods_name_active_idx 
ON foods (name, created_by) 
NULLS NOT DISTINCT 
WHERE (is_active = true);