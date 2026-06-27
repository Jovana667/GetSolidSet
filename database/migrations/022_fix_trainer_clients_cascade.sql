-- Drop the existing foreign key constraint
ALTER TABLE trainer_clients 
DROP CONSTRAINT trainer_clients_client_id_fkey;

-- Re-add it with SET NULL instead of CASCADE
ALTER TABLE trainer_clients 
ADD CONSTRAINT trainer_clients_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES users(id) 
ON DELETE SET NULL;