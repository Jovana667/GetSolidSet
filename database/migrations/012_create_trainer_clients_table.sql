CREATE TABLE trainer_clients (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trainer_clients_trainer_id ON trainer_clients(trainer_id);
CREATE INDEX idx_trainer_clients_client_id ON trainer_clients(client_id);

-- example:
-- idx_trainer_clients_trainer_id
-- "Give me all of Simon's clients"
-- → finds rows where trainer_id = Simon's ID
-- → returns Jessica, Josh, James
-- idx_trainer_clients_client_id
-- "Which trainer does Jessica belong to?"
-- → finds rows where client_id = Jessica's ID
-- → returns Simon

-- Think of it like two different questions:

-- Trainer index → trainer asks "show me my clients"
-- Client index → client asks "who is my trainer" or system 
-- checks "is this person already assigned to a trainer"