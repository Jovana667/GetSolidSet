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
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 cursor-pointer ${
        isEditing && activeMealSlot === mealType
          ? "border-2 border-dashed border-blue-400"
          : ""
      }`}
      onClick={() => setActiveMealSlot(mealType)}
    >
      <h2 className="text-xl font-semibold mb-4">
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}:
      </h2>
      {foods.map((food: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing && activeMealSlot === mealType) {
                setSelectedMealFoodId(food.meal_food_id);
                setServingInput(food.serving);
              }
            }}
          >
            <div className="font-medium">{food.name}</div>
            <div className="text-sm text-gray-600">
              Serving: {food.serving} x 100g | Calories:{" "}
              {(food.calories_per_100g * food.serving).toFixed(1)} | Protein:{" "}
              {(food.protein_per_100g * food.serving).toFixed(1)}g | Carbs:{" "}
              {(food.carbs_per_100g * food.serving).toFixed(1)}g | Fats:{" "}
              {(food.fat_per_100g * food.serving).toFixed(1)}g
            </div>
          </div>
          {selectedMealFoodId === food.meal_food_id && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                value={servingInput}
                onChange={(e) => setServingInput(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="text-sm text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateServing();
                }}
              >
                Save
              </button>
            </div>
          )}
          {isEditing && activeMealSlot === mealType && (
            <button
              className="text-red-400 hover:text-red-600 ml-2"
              onClick={() => {
                setFoodToDelete(food);
                setIsDeleteFoodModalOpen(true);
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {foods.length === 0 && <p className="text-gray-400">No foods</p>}
    </div>
  );
}

export default MealSlot;
