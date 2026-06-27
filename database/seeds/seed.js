const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../../services/auth-service/.env"),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function seed() {
  let successCount = 0;
  let errorCount = 0;

  try {
    const foodsData = JSON.parse(fs.readFileSync("./foods.json", "utf8"));

const allFoods = [
  ...foodsData.proteins,
  ...foodsData.carbs,
  ...foodsData.fruits,
  ...foodsData.vegetables,
  ...foodsData.fats,
];

    console.log("🗑️  Clearing existing foods...");
    await pool.query("DELETE FROM foods WHERE is_custom = false");

    console.log(`📥 Seeding ${allFoods.length} foods...\n`);

    for (const food of allFoods) {
      try {
        await pool.query(
          `INSERT INTO foods (name, category, protein_per_100g, fat_per_100g, carbs_per_100g, calories_per_100g, default_serving_g)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            food.name,
            food.category,
            food.protein_per_100g,
            food.fat_per_100g,
            food.carbs_per_100g,
            food.calories_per_100g,
            food.default_serving_g ?? null,
          ],
        );
        successCount++;
      } catch (itemError) {
        errorCount++;
        console.error(`❌ Error inserting "${food.name}":`, itemError.message);
      }
    }

    console.log("\n✅ Seeding completed!");
    console.log(`   - ${successCount} foods added`);
    console.log(`   - ${errorCount} errors`);

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Fatal seeding error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
