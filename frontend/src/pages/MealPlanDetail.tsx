import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { removeFoodFromMeal, updateFoodServing } from "../services/api";
import FoodPanel from "../components/FoodPanel";
import { addFoodToMeal as addFoodToMealApi } from "../services/api";
import MealSlot from "../components/MealSlot";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { generateShareLink } from "../services/shareApi";
import Footer from "../components/Footer";

function MealPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const { role } = useAuth();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [foodDrawerOpen, setFoodDrawerOpen] = useState(false);
  const [activeMealSlot, setActiveMealSlot] = useState<string | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<any | null>(null);
  const [isDeleteFoodModalOpen, setIsDeleteFoodModalOpen] = useState(false);
  const [selectedMealFoodId, setSelectedMealFoodId] = useState<number | null>(
    null,
  );
  const [servingInput, setServingInput] = useState<number>(100);
  const [formData, setFormData] = useState({ name: "" });

  const calculateMealTotal = useMemo(() => {
    return (mealType: string, metric: string) => {
      const meals = mealPlan?.meals?.[mealType]?.foods || [];
      return meals.reduce((total: number, food: any) => {
        return total + food[`${metric}_per_100g`] * (food.quantity_g / 100);
      }, 0);
    };
  }, [mealPlan]);

  const calculateGrandTotal = useMemo(() => {
    return (metric: string) => {
      return (
        calculateMealTotal("breakfast", metric) +
        calculateMealTotal("lunch", metric) +
        calculateMealTotal("dinner", metric) +
        calculateMealTotal("snack", metric)
      );
    };
  }, [calculateMealTotal]);

  const addFoodToMeal = async (food: any) => {
    if (!activeMealSlot) {
      alert("Please select a meal slot first");
      return;
    }
    try {
      const mealId = mealPlan.meals[activeMealSlot].meal_id;
      await addFoodToMealApi(mealId, {
        food_id: food.id,
        quantity_g: food.default_serving_g ?? 100,
      });
      fetchMealPlan();
    } catch (error) {
      console.error("Failed to add food to meal:", error);
    }
  };

  const { setIsLoggedIn } = useAuth();

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a meal name");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_MEAL_API_URL}/meals/plans/${id}`,
        { name: formData.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMealPlan((prev: any) => ({ ...prev, name: formData.name }));
      setIsEditing(false);
    } catch (error: any) {
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
    if (!confirm("Are you sure you want to delete?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_MEAL_API_URL}/meals/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (role === "trainer" && clientId) {
        navigate(
          `/clients/${clientId}?trainerClientId=${mealPlan.trainer_client_id}`,
          { replace: true },
        );
      } else {
        navigate("/meals", { replace: true });
      }
    } catch (error: any) {
      console.error("Delete failed:", error.message);
      alert("Failed to delete meal plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFoodFromMeal = async () => {
    try {
      const mealId = mealPlan.meals[activeMealSlot].meal_id;
      await removeFoodFromMeal(mealId, foodToDelete.meal_food_id);
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
      const grams = parseFloat(String(servingInput));
      if (isNaN(grams) || grams <= 0) {
        alert("Please enter a valid amount in grams");
        return;
      }
      await updateFoodServing(mealId, selectedMealFoodId, grams);
      setSelectedMealFoodId(null);
      fetchMealPlan();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update serving");
    }
  };

  const fetchMealPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_MEAL_API_URL}/meals/plans/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!mealPlan) return <div className="p-8">Meal plan not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pt-8 px-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 lg:order-1 bg-white rounded-lg shadow p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-1">
                {isEditing ? (
                  <input
                    className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent flex-1 mr-4"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mealPlan.name}
                  </h1>
                )}

                <div className="relative">
                  <button
                    onClick={() => setDropdownMenu(!dropdownMenu)}
                    className="p-2 rounded hover:bg-gray-100 text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>

                  {dropdownMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {mealPlan.is_owner && (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setFormData({ name: mealPlan.name });
                              setDropdownMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              deleteItem();
                              setDropdownMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            const token = await generateShareLink(Number(id));
                            const url = `${window.location.origin}/share/${token}`;
                            try {
                              await navigator.clipboard.writeText(url);
                              alert("Share link copied to clipboard!");
                            } catch {
                              setShareUrl(url);
                            }
                          } catch {
                            alert(
                              "Failed to generate share link. Please try again.",
                            );
                          }
                          setDropdownMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Share Link
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const token = await generateShareLink(Number(id));
                            const url = `${window.location.origin}/share/${token}?print=true`;
                            window.open(url, "_blank");
                          } catch {
                            alert(
                              "Failed to generate share link. Please try again.",
                            );
                          }
                          setDropdownMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-6">
                Created: {new Date(mealPlan.created_at).toLocaleDateString()}
              </p>

              {/* Meal slots */}
              {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                (mealType) => (
                  <MealSlot
                    key={mealType}
                    mealType={mealType}
                    foods={mealPlan.meals[mealType].foods}
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
                ),
              )}

              {/* Bottom row */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <button
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: mealPlan.name });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-green-600 text-white px-6 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <div />
                    <p className="text-sm font-semibold text-gray-700">
                      Total: {calculateGrandTotal("calories").toFixed(0)} cal ·{" "}
                      {calculateGrandTotal("protein").toFixed(1)}g protein ·{" "}
                      {calculateGrandTotal("carbs").toFixed(1)}g carbs ·{" "}
                      {calculateGrandTotal("fat").toFixed(1)}g fats
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right side - Food panel — desktop only */}
            <div className="hidden lg:block lg:order-2">
              <FoodPanel onFoodClick={addFoodToMeal} />
            </div>
          </div>{" "}
          {/* ← closes grid */}
        </div>{" "}
        {/* ← closes max-w-7xl */}
      </div>{" "}
      {/* ← closes flex-1 */}
      {/* Mobile floating Add Food button — outside grid */}
      {isEditing && (
        <button
          className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg z-40 flex items-center gap-2"
          onClick={() => setFoodDrawerOpen(true)}
        >
          <span className="text-xl font-light">+</span>
          <span className="font-medium">Add Food</span>
        </button>
      )}
      {/* Mobile food drawer — outside grid */}
      {foodDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setFoodDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">Add Food</h2>
              <button
                onClick={() => setFoodDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <FoodPanel
                onFoodClick={(food) => {
                  addFoodToMeal(food);
                  setFoodDrawerOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
      {/* Delete food modal */}
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
      {shareUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Share Meal Plan</h3>
            <p className="text-sm text-gray-500 mb-3">
              Copy this link to share with your client:
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4">
              <span className="text-sm text-gray-700 truncate flex-1">
                {shareUrl}
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShareUrl(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert("Copied!");
                  } catch {
                    // If still failing, select the text manually
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealPlanDetail;
