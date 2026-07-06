-- 1. Clear the constraint out of the way if it's already there
ALTER TABLE skin_folds 
DROP CONSTRAINT IF EXISTS unique_trainer_client_week;

-- 2. Build it fresh 
ALTER TABLE skin_folds 
ADD CONSTRAINT unique_trainer_client_week 
UNIQUE (trainer_client_id, week_number);