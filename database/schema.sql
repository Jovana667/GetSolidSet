-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'client' CHECK (role IN ('trainer', 'client')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Foods table
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    protein_per_100g DECIMAL(10, 2) NOT NULL,
    carbs_per_100g DECIMAL(10, 2) NOT NULL,
    fat_per_100g DECIMAL(10, 2) NOT NULL,
    calories_per_100g DECIMAL(10, 2) NOT NULL,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (protein_per_100g >= 0),
    CHECK (carbs_per_100g >= 0),
    CHECK (fat_per_100g >= 0),
    CHECK (calories_per_100g >= 0),
    CONSTRAINT foods_name_unique UNIQUE NULLS NOT DISTINCT (name, created_by)
);

-- meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id SERIAL PRIMARY KEY,  -- Need an ID as primary key!
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,  -- "Summer Cut Week 1"
    is_template BOOLEAN DEFAULT TRUE,
    meal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table 
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,  -- NEW!
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL,  -- 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    meal_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- meal_foods junction table
CREATE TABLE IF NOT EXISTS meal_foods (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    quantity_g DECIMAL(6,2) NOT NULL,
    servings DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_notes (
    id SERIAL PRIMARY KEY,
    trainer_client_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_client_id) REFERENCES trainer_clients(id) ON DELETE CASCADE
);

CREATE TABLE meal_plan_shares (
    id SERIAL PRIMARY KEY,
    meal_plan_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL, 
    created_by INTEGER,          
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,        
    CONSTRAINT unique_meal_plan_share UNIQUE (meal_plan_id),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);

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


-- Create indexes for performance
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_token ON meal_plan_shares(token);
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_plan  ON meal_plan_shares(meal_plan_id);