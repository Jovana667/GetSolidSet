interface MealSlotProps {
  mealType: string;
  foods: any[];
  isEditing: boolean;
  activeMealSlot: string | null;
  setActiveMealSlot: (slot: string) => void;
  selectedMealFoodId: number | null;
  setSelectedMealFoodId: (id: number | null) => void;
  servingInput: number;
  setServingInput: (value: number) => void;
  handleUpdateServing: () => void;
  setFoodToDelete: (food: any) => void;
  setIsDeleteFoodModalOpen: (open: boolean) => void;
}

function MealSlot({
  mealType, foods, isEditing, activeMealSlot, setActiveMealSlot,
  selectedMealFoodId, setSelectedMealFoodId, servingInput, setServingInput,
  handleUpdateServing, setFoodToDelete, setIsDeleteFoodModalOpen,
}: MealSlotProps) {

  const calculateMealTotal = (metric: string) => {
    return foods.reduce((total: number, food: any) => {
      return total + food[`${metric}_per_100g`] * (food.quantity_g / 100);
    }, 0);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-5 mb-4 cursor-pointer ${
        isEditing && activeMealSlot === mealType
          ? "border-2 border-dashed border-blue-400"
          : "border border-gray-100"
      }`}
      onClick={() => setActiveMealSlot(mealType)}
    >
      {/* Meal header */}
      <h2 className="font-semibold text-base text-gray-900 mb-3">
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}:{" "}
        <span className="font-semibold text-gray-600">
          {calculateMealTotal("calories").toFixed(0)} cal ·{" "}
          {calculateMealTotal("protein").toFixed(1)}g protein ·{" "}
          {calculateMealTotal("carbs").toFixed(1)}g carbs ·{" "}
          {calculateMealTotal("fat").toFixed(1)}g fats
        </span>
      </h2>

      {foods.length === 0 ? (
        <p className="text-gray-300 text-sm">No foods added</p>
      ) : (
        <div className="space-y-2">
          {foods.map((food: any, index: number) => (
            <div
              key={index}
              className="flex items-baseline justify-between py-1.5 border-b border-gray-50 last:border-0"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing && activeMealSlot === mealType) {
                  setSelectedMealFoodId(food.meal_food_id);
                  setServingInput(food.quantity_g);
                }
              }}
            >
              {/* Name + grams */}
              <span className="text-sm font-medium text-gray-900">
                {food.name}{" "}
                <span className="font-normal text-gray-400">{Math.round(food.quantity_g)}g</span>
              </span>

              <div className="flex items-center gap-3 ml-6 shrink-0">
                {/* Inline edit input */}
                {selectedMealFoodId === food.meal_food_id && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm text-right"
                      value={servingInput}
                      onChange={(e) => setServingInput(parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      min="0"
                    />
                    <span className="text-xs text-gray-400">g</span>
                    <button
                      className="text-xs text-blue-500 hover:text-blue-700 ml-1"
                      onClick={(e) => { e.stopPropagation(); handleUpdateServing(); }}
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Macros */}
                <span className="text-xs text-gray-400">
                  {(food.calories_per_100g * (food.quantity_g / 100)).toFixed(1)} cal ·{" "}
                  {(food.protein_per_100g * (food.quantity_g / 100)).toFixed(1)}g protein ·{" "}
                  {(food.carbs_per_100g * (food.quantity_g / 100)).toFixed(1)}g carbs ·{" "}
                  {(food.fat_per_100g * (food.quantity_g / 100)).toFixed(1)}g fats
                </span>

                {/* Delete button */}
                {isEditing && activeMealSlot === mealType && (
                  <button
                    className="text-gray-300 hover:text-red-400 text-lg leading-none ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFoodToDelete(food);
                      setIsDeleteFoodModalOpen(true);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MealSlot;
