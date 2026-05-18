CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL,  -- 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    meal_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_foods (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    quantity_g DECIMAL(6,2) NOT NULL,  -- grams of this food
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
