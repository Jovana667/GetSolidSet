ALTER TABLE trainer_clients 
ADD CONSTRAINT trainer_clients_unique 
UNIQUE (trainer_id, client_id);