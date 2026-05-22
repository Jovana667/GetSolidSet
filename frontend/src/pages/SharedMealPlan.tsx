import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getSharedMealPlan } from "../services/shareApi";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

function SharedMealPlan() {
  const { token } = useParams<{ token: string }>();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchSharedMealPlan = async () => {
    try {
      const data = await getSharedMealPlan(token!);
      setMealPlan(data);
      
      // Only print after data has loaded
      if (window.location.search.includes("print=true")) {
        setTimeout(() => window.print(), 500);
      }
    } catch (err) {
      setError("This link is invalid or has been revoked.");
    } finally {
      setLoading(false);
    }
  };

  fetchSharedMealPlan();
}, [token]);

  const calculateMealTotal = useMemo(() => {
    return (mealType: string, metric: string) => {
      const foods = mealPlan?.meals?.[mealType]?.foods || [];
      return foods.reduce((total: number, food: any) => {
        return total + food[`${metric}_per_100g`] * food.serving;
      }, 0);
    };
  }, [mealPlan]);

  const calculateGrandTotal = useMemo(() => {
    return (metric: string) => {
      return MEAL_TYPES.reduce((acc, mt) => acc + calculateMealTotal(mt, metric), 0);
    };
  }, [calculateMealTotal]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg font-medium mb-2">{error}</p>
        <p className="text-gray-500 text-sm">Please ask your trainer for an updated link.</p>
      </div>
    </div>
  );
  if (!mealPlan) return <div className="p-8">Meal plan not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{mealPlan.name}</h1>
          <p className="text-gray-600 mt-1">
            Created: {new Date(mealPlan.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Meal Slots */}
        <div className="bg-white rounded-lg shadow p-6">
          {MEAL_TYPES.map((mealType) => {
            const foods = mealPlan.meals?.[mealType]?.foods || [];
            return (
              <div key={mealType} className="mb-6">
                <h3 className="font-semibold text-lg mb-2 capitalize">
                  {mealType}: {calculateMealTotal(mealType, "calories").toFixed(1)} cal,{" "}
                  {calculateMealTotal(mealType, "protein").toFixed(1)}g protein,{" "}
                  {calculateMealTotal(mealType, "carbs").toFixed(1)}g carbs,{" "}
                  {calculateMealTotal(mealType, "fat").toFixed(1)}g fats
                </h3>
                <div className="border-2 border-dashed border-gray-200 rounded p-4">
                  {foods.length === 0 ? (
                    <p className="text-gray-400 text-sm">No foods added</p>
                  ) : (
                    foods.map((food: any, index: number) => (
                      <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                        <p className="font-medium text-gray-800">{food.name}</p>
                        <p className="text-sm text-gray-500">
                          Serving: {food.serving} x 100g | Calories:{" "}
                          {(food.calories_per_100g * food.serving).toFixed(1)} | Protein:{" "}
                          {(food.protein_per_100g * food.serving).toFixed(1)}g | Carbs:{" "}
                          {(food.carbs_per_100g * food.serving).toFixed(1)}g | Fats:{" "}
                          {(food.fat_per_100g * food.serving).toFixed(1)}g
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Grand Total */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-lg">
              Calories: {calculateGrandTotal("calories").toFixed(1)} cal,
              Protein: {calculateGrandTotal("protein").toFixed(1)}g, Carbs:{" "}
              {calculateGrandTotal("carbs").toFixed(1)}g, Fats:{" "}
              {calculateGrandTotal("fat").toFixed(1)}g
            </h3>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          This is a read-only view. Contact your trainer to make changes.
        </p>
      </div>
    </div>
  );
}

export default SharedMealPlan;