ALTER TABLE trainer_clients
ADD COLUMN client_email VARCHAR(255);
ALTER TABLE trainer_clients
ALTER COLUMN client_id DROP NOT NULL;