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
  mealType,
  foods,
  isEditing,
  activeMealSlot,
  setActiveMealSlot,
  selectedMealFoodId,
  setSelectedMealFoodId,
  servingInput,
  setServingInput,
  handleUpdateServing,
  setFoodToDelete,
  setIsDeleteFoodModalOpen,
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
              className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-start"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing && activeMealSlot === mealType) {
                  setSelectedMealFoodId(
                    selectedMealFoodId === food.meal_food_id
                      ? null
                      : food.meal_food_id,
                  );
                  setServingInput(food.quantity_g);
                }
              }}
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 mb-2">
                  {food.name}
                </div>

                {/* Gram input — shown when this food is selected in edit mode */}
                {isEditing &&
                activeMealSlot === mealType &&
                selectedMealFoodId === food.meal_food_id ? (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={servingInput}
                        onChange={(e) =>
                          setServingInput(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.stopPropagation()}
                        min="0"
                        autoFocus
                      />
                      <span className="text-sm text-gray-500">g</span>
                      <button
                        className="ml-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateServing();
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="text-sm text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMealFoodId(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mb-1">
                    {Math.round(food.quantity_g)}g
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {(food.calories_per_100g * (food.quantity_g / 100)).toFixed(
                    1,
                  )}{" "}
                  cal ·{" "}
                  {(food.protein_per_100g * (food.quantity_g / 100)).toFixed(1)}
                  g protein ·{" "}
                  {(food.carbs_per_100g * (food.quantity_g / 100)).toFixed(1)}g
                  carbs ·{" "}
                  {(food.fat_per_100g * (food.quantity_g / 100)).toFixed(1)}g
                  fats
                </div>
              </div>

              {isEditing && activeMealSlot === mealType && (
                <button
                  className="text-gray-300 hover:text-red-400 ml-3 text-lg leading-none flex-shrink-0"
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
          ))}
        </div>
      )}
    </div>
  );
}

export default MealSlot;
