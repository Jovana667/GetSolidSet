import { useState, useEffect, useMemo } from "react";
import { getFoods, deleteCustomFood } from "../services/api";
import { Trash2 } from "lucide-react";
import CustomFoodForm from "./CustomFoodForm";

interface FoodPanelProps {
  onFoodClick: (food: any) => void;
}

function FoodPanel({ onFoodClick }: FoodPanelProps) {
  // FoodPanel's own internal state
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCounts, setVisibleCounts] = useState({
    protein: 15,
    carbs: 15,
    fats: 15,
  });
  const [isAddingCustomFood, setIsAddingCustomFood] = useState(false);

  // Delete custom food state
  const [selectedFoodIds, setSelectedFoodIds] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Foods state
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // fetching foods on mount
  const fetchFoods = async () => {
    try {
      const data = await getFoods();
      setFoods(data.foods || []);
    } catch (error) {
      console.error("Failed to fetch foods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const loadMore = (category: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [category]: prev[category as keyof typeof prev] + 15,
    }));
  };

  const showLess = (category: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [category]: 15, // Reset to 15
    }));
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const toggleFoodSelection = (foodId: number) => {
    if (selectedFoodIds.includes(foodId)) {
      // already selected — remove it
      setSelectedFoodIds(selectedFoodIds.filter((id) => id !== foodId));
    } else {
      // not selected — add it
      setSelectedFoodIds([...selectedFoodIds, foodId]);
    }
  };

  const handleDeleteFoods = async () => {
    try {
      setIsDeleteModalOpen(false);
      await Promise.all(selectedFoodIds.map((id) => deleteCustomFood(id)));
      setSelectedFoodIds([]);
      await fetchFoods();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete food");
    }
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [foods, searchTerm]);

  const groupedFoods = useMemo(() => {
    return {
      protein: filteredFoods.filter((f) => f.category === "protein"),
      carbs: filteredFoods.filter((f) => f.category === "carbs"),
      fats: filteredFoods.filter((f) => f.category === "fats"),
    };
  }, [filteredFoods]);

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  return (
    <div className="order-1 lg:order-2 bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Foods</h2>
        <div className="flex items-center gap-2">
          {selectedFoodIds.length > 0 && (
            <button onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 size={16} />
            </button>
          )}
          <button
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setIsAddingCustomFood(!isAddingCustomFood)}
          >
            {isAddingCustomFood ? "Cancel" : "+ Add Custom Food"}
          </button>
        </div>
      </div>

      {isAddingCustomFood && (
        <CustomFoodForm
          onSuccess={() => setIsAddingCustomFood(false)}
          onFoodAdded={fetchFoods}
        />
      )}

      {/* Search Input with Clear Button */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Show loading message */}
      {loading && (
        <div className="text-center text-gray-500 py-4">Loading foods...</div>
      )}

      {/* Show no foods found message */}
      {!loading && searchTerm && filteredFoods.length === 0 && (
        <div className="text-center text-gray-500 py-4">No foods found.</div>
      )}

      {/* Protein Category */}
      <div className="mb-4">
        <button
          onClick={() => toggleCategory("protein")}
          className="w-full flex justify-between items-center p-2 hover:bg-gray-100 rounded"
        >
          <span className="font-medium">
            ➕ Protein ({groupedFoods.protein.length})
          </span>
        </button>

        {expandedCategories.includes("protein") && (
          <div className="mt-2 space-y-1">
            {groupedFoods.protein
              .slice(0, visibleCounts.protein)
              .map((food) => (
                <div
                  key={food.id}
                  className="group flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded text-sm"
                >
                  {food.is_custom && (
                    <input
                      type="checkbox"
                      className="opacity-0 group-hover:opacity-100 checked:opacity-100 mr-2"
                      checked={selectedFoodIds.includes(food.id)}
                      onChange={() => toggleFoodSelection(food.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div onClick={() => onFoodClick(food)}>
                    <div className="font-medium">{food.name}</div>
                    <div className="text-xs text-gray-600">
                      {food.protein_per_100g}g P | {food.carbs_per_100g}g C |{" "}
                      {food.fat_per_100g}g F | {food.calories_per_100g} cal
                    </div>
                  </div>
                </div>
              ))}

            {groupedFoods.protein.length > visibleCounts.protein && (
              <button
                onClick={() => loadMore("protein")}
                className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                Load More ({groupedFoods.protein.length - visibleCounts.protein}{" "}
                more)
              </button>
            )}

            {groupedFoods.protein.length <= visibleCounts.protein &&
              groupedFoods.protein.length > 15 && (
                <button
                  onClick={() => showLess("protein")}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  Show Less
                </button>
              )}

            {/* If all items shown AND more than 15 → Show Less */}
            {groupedFoods.protein.length <= visibleCounts.protein &&
              groupedFoods.protein.length > 15 && (
                <button onClick={() => showLess("protein")}>Show Less</button>
              )}
          </div>
        )}
      </div>

      {/* Carbs Category */}
      <div className="mb-4">
        <button
          onClick={() => toggleCategory("carbs")}
          className="w-full flex justify-between items-center p-2 hover:bg-gray-100 rounded"
        >
          <span className="font-medium">
            ➕ Carbs ({groupedFoods.carbs.length})
          </span>
        </button>

        {expandedCategories.includes("carbs") && (
          <div className="mt-2 space-y-1">
            {groupedFoods.carbs.slice(0, visibleCounts.carbs).map((food) => (
              <div
                key={food.id}
                className="group flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded text-sm"
              >
                {food.is_custom && (
                  <input
                    type="checkbox"
                    className="opacity-0 group-hover:opacity-100 checked:opacity-100 mr-2"
                    checked={selectedFoodIds.includes(food.id)}
                    onChange={() => toggleFoodSelection(food.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <div onClick={() => onFoodClick(food)}>
                  <div className="font-medium">{food.name}</div>
                  <div className="text-xs text-gray-600">
                    {food.protein_per_100g}g P | {food.carbs_per_100g}g C |{" "}
                    {food.fat_per_100g}g F | {food.calories_per_100g} cal
                  </div>
                </div>
              </div>
            ))}

            {groupedFoods.carbs.length > visibleCounts.carbs && (
              <button
                onClick={() => loadMore("carbs")}
                className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                Load More ({groupedFoods.carbs.length - visibleCounts.carbs}{" "}
                more)
              </button>
            )}

            {groupedFoods.carbs.length <= visibleCounts.carbs &&
              groupedFoods.carbs.length > 15 && (
                <button
                  onClick={() => showLess("carbs")}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  Show Less
                </button>
              )}
          </div>
        )}
      </div>

      {/* Fats Category */}
      <div className="mb-4">
        <button
          onClick={() => toggleCategory("fats")}
          className="w-full flex justify-between items-center p-2 hover:bg-gray-100 rounded"
        >
          <span className="font-medium">
            ➕ Fats ({groupedFoods.fats.length})
          </span>
        </button>

        {expandedCategories.includes("fats") && (
          <div className="mt-2 space-y-1">
            {groupedFoods.fats.slice(0, visibleCounts.fats).map((food) => (
              <div
                key={food.id}
                className="group flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded text-sm"
              >
                {food.is_custom && (
                  <input
                    type="checkbox"
                    className="opacity-0 group-hover:opacity-100 checked:opacity-100 mr-2"
                    checked={selectedFoodIds.includes(food.id)}
                    onChange={() => toggleFoodSelection(food.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <div onClick={() => onFoodClick(food)}>
                  <div className="font-medium">{food.name}</div>
                  <div className="text-xs text-gray-600">
                    {food.protein_per_100g}g P | {food.carbs_per_100g}g C |{" "}
                    {food.fat_per_100g}g F | {food.calories_per_100g} cal
                  </div>
                </div>
              </div>
            ))}

            {groupedFoods.fats.length > visibleCounts.fats && (
              <button
                onClick={() => loadMore("fats")}
                className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                Load More ({groupedFoods.fats.length - visibleCounts.fats} more)
              </button>
            )}

            {groupedFoods.fats.length <= visibleCounts.fats &&
              groupedFoods.fats.length > 15 && (
                <button
                  onClick={() => showLess("fats")}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  Show Less
                </button>
              )}
          </div>
        )}
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Custom Food</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedFoodIds.length} item
              {selectedFoodIds.length > 1 ? "s" : ""}? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteFoods}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodPanel;
