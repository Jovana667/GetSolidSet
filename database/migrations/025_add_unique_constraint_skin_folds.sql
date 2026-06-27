ALTER TABLE skin_folds 
ADD CONSTRAINT unique_trainer_client_week 
UNIQUE (trainer_client_id, week_number);