import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { removeFoodFromMeal, updateFoodServing } from "../services/api";
import FoodPanel from "../components/FoodPanel";
import { addFoodToMeal as addFoodToMealApi } from "../services/api";
import MealSlot from "../components/MealSlot";

function MealPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeMealSlot, setActiveMealSlot] = useState<string | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<any | null>(null);
  const [isDeleteFoodModalOpen, setIsDeleteFoodModalOpen] = useState(false);
  const [selectedMealFoodId, setSelectedMealFoodId] = useState<number | null>(
    null,
  );
  const [servingInput, setServingInput] = useState<number>(1);
  const [formData, setFormData] = useState({ name: "" });

  const calculateGrandTotal = (metric) => {
    return (
      calculateMealTotal("breakfast", metric) +
      calculateMealTotal("lunch", metric) +
      calculateMealTotal("dinner", metric) +
      calculateMealTotal("snack", metric)
    );
  };

  const addFoodToMeal = async (food: any) => {
    if (!activeMealSlot) {
      alert("Please select a meal slot first");
      return;
    }
    try {
      const mealId = mealPlan.meals[activeMealSlot].meal_id;
      await addFoodToMealApi(mealId, { food_id: food.id, servings: 1 });
      fetchMealPlan();
    } catch (error) {
      console.error("Failed to add food to meal:", error);
    }
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
      alert("Failed to delete meal plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFoodFromMeal = async () => {
    try {
      const mealId = mealPlan.meals[activeMealSlot].meal_id;
      const mealFoodId = foodToDelete.meal_food_id;

      await removeFoodFromMeal(mealId, mealFoodId);

      setIsDeleteFoodModalOpen(false);
      setFoodToDelete(null);
      fetchMealPlan();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to remove food from meal");
    }
  };

  const handleUpdateServing = async () => {
    try {
      const mealId = mealPlan.meals[activeMealSlot].meal_id;
      const mealFoodId = selectedMealFoodId;
      await updateFoodServing(mealId, mealFoodId, servingInput);
      setSelectedMealFoodId(null);
      fetchMealPlan();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update serving");
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

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

  useEffect(() => {
    fetchMealPlan();
  }, [id, navigate]);

  const calculateMealTotal = (mealType: string, metric: string) => {
    const meals = mealPlan?.meals?.[mealType]?.foods || [];
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
            <MealSlot
              mealType="breakfast"
              foods={mealPlan.meals.breakfast.foods}
              isEditing={isEditing}
              activeMealSlot={activeMealSlot}
              setActiveMealSlot={setActiveMealSlot}
              selectedMealFoodId={selectedMealFoodId}
              setSelectedMealFoodId={setSelectedMealFoodId}
              servingInput={servingInput}
              setServingInput={setServingInput}
              handleUpdateServing={handleUpdateServing}
              setFoodToDelete={setFoodToDelete}
              setIsDeleteFoodModalOpen={setIsDeleteFoodModalOpen}
            />

            {/* Lunch */}
            <MealSlot
              mealType="lunch"
              foods={mealPlan.meals.lunch.foods}
              isEditing={isEditing}
              activeMealSlot={activeMealSlot}
              setActiveMealSlot={setActiveMealSlot}
              selectedMealFoodId={selectedMealFoodId}
              setSelectedMealFoodId={setSelectedMealFoodId}
              servingInput={servingInput}
              setServingInput={setServingInput}
              handleUpdateServing={handleUpdateServing}
              setFoodToDelete={setFoodToDelete}
              setIsDeleteFoodModalOpen={setIsDeleteFoodModalOpen}
            />

            {/* Dinner */}
            <MealSlot
              mealType="dinner"
              foods={mealPlan.meals.dinner.foods}
              isEditing={isEditing}
              activeMealSlot={activeMealSlot}
              setActiveMealSlot={setActiveMealSlot}
              selectedMealFoodId={selectedMealFoodId}
              setSelectedMealFoodId={setSelectedMealFoodId}
              servingInput={servingInput}
              setServingInput={setServingInput}
              handleUpdateServing={handleUpdateServing}
              setFoodToDelete={setFoodToDelete}
              setIsDeleteFoodModalOpen={setIsDeleteFoodModalOpen}
            />

            {/* Snack */}
            <MealSlot
              mealType="snack"
              foods={mealPlan.meals.snack.foods}
              isEditing={isEditing}
              activeMealSlot={activeMealSlot}
              setActiveMealSlot={setActiveMealSlot}
              selectedMealFoodId={selectedMealFoodId}
              setSelectedMealFoodId={setSelectedMealFoodId}
              servingInput={servingInput}
              setServingInput={setServingInput}
              handleUpdateServing={handleUpdateServing}
              setFoodToDelete={setFoodToDelete}
              setIsDeleteFoodModalOpen={setIsDeleteFoodModalOpen}
            />

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
          <FoodPanel onFoodClick={addFoodToMeal} />
        </div>
      </div>
      {isDeleteFoodModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Remove Food</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove {foodToDelete?.name} from this
              meal?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setIsDeleteFoodModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteFoodFromMeal}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealPlanDetail;
