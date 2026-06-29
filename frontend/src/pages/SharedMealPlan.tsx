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
        return total + food[`${metric}_per_100g`] * (food.quantity_g / 100);
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
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-container { padding: 16px !important; background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 print-container">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-lg shadow print-card px-4 sm:px-6 py-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{mealPlan.name}</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Created: {new Date(mealPlan.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Meals */}
          <div className="bg-white rounded-lg shadow print-card px-4 sm:px-6 py-5">
            {MEAL_TYPES.map((mealType, i) => {
              const foods = mealPlan.meals?.[mealType]?.foods || [];
              const hasNext = i < MEAL_TYPES.length - 1;
              return (
                <div key={mealType} className={hasNext ? "mb-6 pb-6 border-b border-gray-100" : "mb-2"}>
                  <h3 className="font-semibold text-base text-gray-900 mb-3">
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}:{" "}
                    <span className="font-semibold text-gray-600">
                      {calculateMealTotal(mealType, "calories").toFixed(0)} cal ·{" "}
                      {calculateMealTotal(mealType, "protein").toFixed(1)}g protein ·{" "}
                      {calculateMealTotal(mealType, "carbs").toFixed(1)}g carbs ·{" "}
                      {calculateMealTotal(mealType, "fat").toFixed(1)}g fats
                    </span>
                  </h3>

                  {foods.length === 0 ? (
                    <p className="text-gray-300 text-sm">No foods added</p>
                  ) : (
                    <div className="space-y-2">
                      {foods.map((food: any, index: number) => (
                        <div key={index} className="py-1.5 border-b border-gray-50 last:border-0">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-gray-900">
                              {food.name}
                            </span>
                            <span className="text-sm text-gray-400 ml-2 shrink-0">
                              {Math.round(food.quantity_g)}g
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {(food.calories_per_100g * (food.quantity_g / 100)).toFixed(1)} cal ·{" "}
                            {(food.protein_per_100g * (food.quantity_g / 100)).toFixed(1)}g protein ·{" "}
                            {(food.carbs_per_100g * (food.quantity_g / 100)).toFixed(1)}g carbs ·{" "}
                            {(food.fat_per_100g * (food.quantity_g / 100)).toFixed(1)}g fats
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Grand total */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700">
                Total: {calculateGrandTotal("calories").toFixed(0)} cal ·{" "}
                {calculateGrandTotal("protein").toFixed(1)}g protein ·{" "}
                {calculateGrandTotal("carbs").toFixed(1)}g carbs ·{" "}
                {calculateGrandTotal("fat").toFixed(1)}g fats
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 no-print">
            This is a read-only view. Contact your trainer to make changes.
          </p>
        </div>
      </div>
    </>
  );
}

export default SharedMealPlan;