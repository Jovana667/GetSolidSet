import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getFoods, createMeal } from "../services/api";
import CustomFoodForm from "../components/CustomFoodForm";
import { Trash2 } from "lucide-react";

function MealPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [foods, setFoods] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingCustomFood, setIsAddingCustomFood] = useState(false);
  const [selectedFoodIds, setSelectedFoodIds] = useState<number[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [visibleCounts, setVisibleCounts] = useState({
    protein: 15,
    carbs: 15,
    fats: 15,
  });

  const calculateGrandTotal = (metric) => {
    return (
      calculateMealTotal("breakfast", metric) +
      calculateMealTotal("lunch", metric) +
      calculateMealTotal("dinner", metric) +
      calculateMealTotal("snack", metric)
    );
  };

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

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const addFoodToMeal = (food: any) => {
    // Define what happens when you add food
    console.log("Adding food:", food);
  };

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedFoods = {
    protein: filteredFoods.filter((f) => f.category === "protein"),
    carbs: filteredFoods.filter((f) => f.category === "carbs"),
    fats: filteredFoods.filter((f) => f.category === "fats"),
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a meal name");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:3003/api/meals/plans/${id}`,
        { name: formData.name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Meal updated successfully");
      alert("Meal plan updated successfully!");

      // Update the meal plan data in state to reflect the changes
      setMealPlan((prev) => ({
        ...prev,
        name: formData.name,
      }));

      setIsEditing(false);
    } catch (error: any) {
      console.error("Something went wrong:", error);

      // Handle different types of errors
      if (error.response?.status === 401) {
        alert("You're not authorized to edit this meal plan. Please log in.");
      } else if (error.response?.status === 404) {
        alert("Meal plan not found.");
      } else if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Failed to update meal plan. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    let userConfirmed = confirm("Are you sure you want to delete?");
    if (!userConfirmed) return;
    setLoading(true);

    try {
      await axios.delete(`http://localhost:3003/api/meals/plans/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log(`Item ${id} deleted successfully`);
      navigate("/meals", { replace: true });
    } catch (error) {
      console.error("Delete failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFoods = async () => {
  try {
    setIsDeleteModalOpen(false);
    await Promise.all(selectedFoodIds.map(id => deleteCustomFood(id)));
    setSelectedFoodIds([]);
    await fetchFoods();
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete food")
  }
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

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const fetchFoods = async () => {
    try {
      const data = await getFoods();
      console.log("Foods fetched successfully:", data);
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

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:3003/api/meals/plans/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setMealPlan(response.data);
      } catch (err) {
        console.error("Error fetching meal plan:", err);
        setError("Failed to load meal plan");
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [id, navigate]);

  const calculateMealTotal = (mealType: string, metric: string) => {
    const meals = mealPlan?.meals?.[mealType] || [];
    return meals.reduce((total: number, food: any) => {
      return total + food[`${metric}_per_100g`] * food.serving;
    }, 0);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!mealPlan) return <div className="p-8">Meal plan not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Macrology</h1>
          <div className="space-x-4">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <Link
              to="/meals"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Meals
            </Link>
            <Link
              to="/"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={handleLogout}
            >
              Log Out
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Meal Planner (2/3 width) */}
          <div className="lg:col-span-2 order-2 lg:order-1 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              {isEditing ? (
                <input
                  className="text-3xl font-bold text-gray-900" // ← Add this!
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">
                  {mealPlan.name}
                </h1>
              )}

              <div className="flex space-x-2">
                {isEditing && (
                  <button
                    className="mt-6 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: mealPlan.name }); // Reset to original name
                    }}
                  >
                    Cancel
                  </button>
                )}

                {/* delete button */}
                <button
                  className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  onClick={() => {
                    deleteItem();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600">
              Created: {new Date(mealPlan.created_at).toLocaleDateString()}
            </p>

            {/* Breakfast */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Breakfast: </h2>
              <div className="space-y-2">
                {mealPlan.meals.breakfast.map((food: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      Serving: {food.serving} x 100g | Calories:{" "}
                      {(food.calories_per_100g * food.serving).toFixed(1)} |
                      Protein:{" "}
                      {(food.protein_per_100g * food.serving).toFixed(1)}g |
                      Carbs: {(food.carbs_per_100g * food.serving).toFixed(1)}g
                      | Fats: {(food.fat_per_100g * food.serving).toFixed(1)}g
                    </div>
                  </div>
                ))}
                {mealPlan.meals.breakfast.length === 0 && (
                  <p className="text-gray-400">No foods</p>
                )}
              </div>
            </div>

            {/* Lunch */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Lunch: </h2>
              <div className="space-y-2">
                {mealPlan.meals.lunch.map((food: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      Serving: {food.serving} x 100g | Calories:{" "}
                      {(food.calories_per_100g * food.serving).toFixed(1)} |
                      Protein:{" "}
                      {(food.protein_per_100g * food.serving).toFixed(1)}g |
                      Carbs: {(food.carbs_per_100g * food.serving).toFixed(1)}g
                      | Fats: {(food.fat_per_100g * food.serving).toFixed(1)}g
                    </div>
                  </div>
                ))}
                {mealPlan.meals.lunch.length === 0 && (
                  <p className="text-gray-400">No foods</p>
                )}
              </div>
            </div>

            {/* Dinner */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Dinner: </h2>
              <div className="space-y-2">
                {mealPlan.meals.dinner.map((food: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      Serving: {food.serving} x 100g | Calories:{" "}
                      {(food.calories_per_100g * food.serving).toFixed(1)} |
                      Protein:{" "}
                      {(food.protein_per_100g * food.serving).toFixed(1)}g |
                      Carbs: {(food.carbs_per_100g * food.serving).toFixed(1)}g
                      | Fats: {(food.fat_per_100g * food.serving).toFixed(1)}g
                    </div>
                  </div>
                ))}
                {mealPlan.meals.dinner.length === 0 && (
                  <p className="text-gray-400">No foods</p>
                )}
              </div>
            </div>

            {/* Snack */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Snack: </h2>
              <div className="space-y-2">
                {mealPlan.meals.snack.map((food: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      Serving: {food.serving} x 100g | Calories:{" "}
                      {(food.calories_per_100g * food.serving).toFixed(1)} |
                      Protein:{" "}
                      {(food.protein_per_100g * food.serving).toFixed(1)}g |
                      Carbs: {(food.carbs_per_100g * food.serving).toFixed(1)}g
                      | Fats: {(food.fat_per_100g * food.serving).toFixed(1)}g
                    </div>
                  </div>
                ))}
                {mealPlan.meals.snack.length === 0 && (
                  <p className="text-gray-400">No foods</p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {isEditing ? (
                // EDIT MODE - show Save button
                <button
                  className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Meal"}
                </button>
              ) : (
                // VIEW MODE - show Edit button
                <button
                  className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  onClick={() => {
                    setIsEditing(true);
                    setFormData({ name: mealPlan.name });
                  }}
                >
                  Edit Meal
                </button>
              )}

              {/* Grand Total */}
              <div className="mt-6 pt-6 ">
                <h3 className="font-semibold text-lg">
                  Calories: {calculateGrandTotal("calories").toFixed(1)} cal,
                  Protein: {calculateGrandTotal("protein").toFixed(1)}g, Carbs:{" "}
                  {calculateGrandTotal("carbs").toFixed(1)}g, Fats:{" "}
                  {calculateGrandTotal("fat").toFixed(1)}g
                </h3>
              </div>
            </div>
          </div>

          {/* Right side - 1/3 width */}
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
                        {/* Checkbox — only for custom foods, hidden until hover */}
                        {food.is_custom && (
                          <input
                            type="checkbox"
                            className="opacity-0 group-hover:opacity-100 checked:opacity-100 mr-2"
                            checked={selectedFoodIds.includes(food.id)}
                            onChange={() => toggleFoodSelection(food.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        {/* Food info */}
                        <div onClick={() => addFoodToMeal(food)}>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-gray-600">
                            {food.protein_per_100g}g P | {food.carbs_per_100g}g
                            C | {food.fat_per_100g}g F |{" "}
                            {food.calories_per_100g} cal
                          </div>
                        </div>
                      </div>
                    ))}

                  {groupedFoods.protein.length > visibleCounts.protein && (
                    <button
                      onClick={() => loadMore("protein")}
                      className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
                    >
                      Load More (
                      {groupedFoods.protein.length - visibleCounts.protein}{" "}
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
                  {groupedFoods.carbs
                    .slice(0, visibleCounts.carbs)
                    .map((food) => (
                      <div
                        key={food.id}
                        className="group flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded text-sm"
                      >
                        {food.is_custom && (
                          <input
                            type="checkbox"
                            className="opacity-0 group-hover:opacity-100 mr-2"
                            checked={selectedFoodIds.includes(food.id)}
                            onChange={() => toggleFoodSelection(food.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div onClick={() => addFoodToMeal(food)}>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-gray-600"></div>
                          {food.protein_per_100g}g P | {food.carbs_per_100g}g C
                          | {food.fat_per_100g}g F | {food.calories_per_100g}{" "}
                          cal
                        </div>
                      </div>
                    ))}

                  {groupedFoods.carbs.length > visibleCounts.carbs && (
                    <button
                      onClick={() => loadMore("carbs")}
                      className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
                    >
                      Load More (
                      {groupedFoods.carbs.length - visibleCounts.carbs} more)
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
                  {groupedFoods.fats
                    .slice(0, visibleCounts.fats)
                    .map((food) => (
                      <div
                        key={food.id}
                        className="group flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded text-sm"
                      >
                        {food.is_custom && (
                          <input
                            type="checkbox"
                            className="opacity-0 group-hover:opacity-100 mr-2"
                            checked={selectedFoodIds.includes(food.id)}
                            onChange={() => toggleFoodSelection(food.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="font-medium">{food.name}</div>
                        <div className="text-xs text-gray-600">
                          {food.protein_per_100g}g P | {food.carbs_per_100g}g C
                          | {food.fat_per_100g}g F | {food.calories_per_100g}{" "}
                          cal
                        </div>
                      </div>
                    ))}

                  {groupedFoods.fats.length > visibleCounts.fats && (
                    <button
                      onClick={() => loadMore("fats")}
                      className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
                    >
                      Load More ({groupedFoods.fats.length - visibleCounts.fats}{" "}
                      more)
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
          </div>
        </div>
      </div>
      {isDeleteModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <h3 className="text-lg font-semibold mb-2">Delete Custom Food</h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete {selectedFoodIds.length} item{selectedFoodIds.length > 1 ? "s" : ""}? This cannot be undone.
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

export default MealPlanDetail;
