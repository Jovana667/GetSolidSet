ALTER TABLE foods
ADD COLUMN IF NOT EXISTS default_serving_g DECIMAL(6,2);

COMMENT ON COLUMN foods.default_serving_g IS 'Suggested default serving size in grams shown in the food panel (e.g. 150 for chicken breast, 28 for almonds). Nullable — falls back to 100g if not set.';