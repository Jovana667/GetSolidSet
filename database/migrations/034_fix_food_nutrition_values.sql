-- Corrects per-100g values for built-in foods. Updates in place: food IDs and meal plans are untouched.
BEGIN;
UPDATE foods SET protein_per_100g=12.6, carbs_per_100g=0.7, fat_per_100g=9.5, calories_per_100g=138.7 WHERE name='Whole egg' AND is_custom=false;
UPDATE foods SET protein_per_100g=10.9, carbs_per_100g=0.7, fat_per_100g=0.2, calories_per_100g=48.2 WHERE name='Egg whites' AND is_custom=false;
UPDATE foods SET protein_per_100g=8.8, carbs_per_100g=33.7, fat_per_100g=2.0, calories_per_100g=188.0 WHERE name='English muffin (wholemeal)' AND is_custom=false;
UPDATE foods SET protein_per_100g=8.8, carbs_per_100g=41.7, fat_per_100g=1.6, calories_per_100g=216.4 WHERE name='English muffin (white)' AND is_custom=false;
UPDATE foods SET protein_per_100g=8.2, carbs_per_100g=77.3, fat_per_100g=2.8, calories_per_100g=367.2 WHERE name='Rice cakes' AND is_custom=false;
UPDATE foods SET protein_per_100g=0.3, carbs_per_100g=11.4, fat_per_100g=0.2, calories_per_100g=48.6 WHERE name='Apple' AND is_custom=false;
UPDATE foods SET protein_per_100g=2.2, carbs_per_100g=1.8, fat_per_100g=0.1, calories_per_100g=16.9 WHERE name='Asparagus' AND is_custom=false;
COMMIT;