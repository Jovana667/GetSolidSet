CREATE TABLE skin_fold (
    id SERIAL PRIMARY KEY,
    trainer_client_id INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    weight_kg FLOAT,
    triceps FLOAT,
    biceps FLOAT,
    chest FLOAT,
    subscapular FLOAT,
    midaxillary FLOAT,
    suprailiac FLOAT,
    abdominal FLOAT,
    thigh FLOAT,
    hamstring FLOAT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_client_id) REFERENCES trainer_clients(id) ON DELETE CASCADE
);