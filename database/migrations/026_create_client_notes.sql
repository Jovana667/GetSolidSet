CREATE TABLE IF NOT EXISTS client_notes (
    id SERIAL PRIMARY KEY,
    trainer_client_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_client_id) REFERENCES trainer_clients(id) ON DELETE CASCADE
);