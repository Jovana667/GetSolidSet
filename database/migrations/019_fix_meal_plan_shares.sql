-- 1. Safely drop the constraint if it already exists from a previous run
ALTER TABLE meal_plan_shares 
DROP CONSTRAINT IF EXISTS unique_meal_plan_share;

-- 2. Now that the runway is 100% clear, add the constraint cleanly
ALTER TABLE meal_plan_shares
ADD CONSTRAINT unique_meal_plan_share UNIQUE (meal_plan_id);