import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createMeal, getClients } from "../services/api";
import Navbar from "../components/Navbar";
import FoodPanel from "../components/FoodPanel";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function Home() {
  const [mealName, setMealName] = useState("");
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast"); // which meal is active
  const [mealFoods, setMealFoods] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [foodDrawerOpen, setFoodDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const trainerClientId = searchParams.get("trainerClientId");
  const [selectClientModal, setSelectClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const navigate = useNavigate();
  const { role } = useAuth();
  const [clients, setClients] = useState<any[]>([]);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const addFoodToMeal = (food: any) => {
    console.log("food object:", food);
    const foodWithServing = {
      ...food,
      quantity_g: food.default_serving_g ?? 100,
    };
    setMealFoods({
      ...mealFoods,
      [selectedMeal]: [
        ...mealFoods[selectedMeal as keyof typeof mealFoods],
        foodWithServing,
      ],
    });
  };

  const updateFoodServing = (
    mealType: string,
    foodIndex: number,
    newValue: string,
  ) => {
    const updatedMealFoods = { ...mealFoods };
    const updatedMeal = [...mealFoods[mealType as keyof typeof mealFoods]];
    updatedMeal[foodIndex] = {
      ...updatedMeal[foodIndex],
      quantity_g: parseFloat(newValue) || 0,
    };
    updatedMealFoods[mealType as keyof typeof mealFoods] = updatedMeal;
    setMealFoods(updatedMealFoods);
  };

  const removeFoodFromMeal = (mealType: string, foodIndex: number) => {
    const updatedMealFoods = { ...mealFoods };
    const updatedMeal = [...mealFoods[mealType as keyof typeof mealFoods]];

    // Remove the food at the specified index
    updatedMeal.splice(foodIndex, 1);

    updatedMealFoods[mealType as keyof typeof mealFoods] = updatedMeal;
    setMealFoods(updatedMealFoods);
  };

  const calculateMealTotal = useMemo(() => {
    return (mealType: string, metric: string) => {
      return mealFoods[mealType].reduce((total, food) => {
        return total + food[`${metric}_per_100g`] * (food.quantity_g / 100);
      }, 0);
    };
  }, [mealFoods]);

  const calculateGrandTotal = useMemo(() => {
    return (metric) => {
      return (
        calculateMealTotal("breakfast", metric) +
        calculateMealTotal("lunch", metric) +
        calculateMealTotal("dinner", metric) +
        calculateMealTotal("snack", metric)
      );
    };
  }, [calculateMealTotal]);

  const handleSaveMeal = async () => {
    // Check authentication first
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save your meal.");
      window.location.href = "/login";
      return;
    }
    // Step 2: Transform mealFoods to backend format
    const transformedFoods = {
      breakfast: mealFoods.breakfast.map((food) => ({
        food_id: food.id,
        quantity_g: food.quantity_g,
      })),
      lunch: mealFoods.lunch.map((food) => ({
        food_id: food.id,
        quantity_g: food.quantity_g,
      })),
      dinner: mealFoods.dinner.map((food) => ({
        food_id: food.id,
        quantity_g: food.quantity_g,
      })),
      snack: mealFoods.snack.map((food) => ({
        food_id: food.id,
        quantity_g: food.quantity_g,
      })),
    };

    console.log("trainer_client_id being sent:", trainerClientId);
    console.log("all search params:", Object.fromEntries(searchParams));

    // Step 3: Prepare the meal data
    const mealData = {
      name: mealName,
      is_template: true,
      meal_date: new Date().toISOString().split("T")[0], // Today's date
      foods: transformedFoods,
      trainer_client_id: selectedClient
        ? selectedClient.trainer_client_id
        : trainerClientId
          ? parseInt(trainerClientId)
          : null,
    };
    if (!mealName.trim()) {
      alert("Please enter a meal plan name");
      return;
    }
    console.log("Sending meal data:", JSON.stringify(mealData, null, 2));

    // Step 4: Send to backend
    try {
      const response = await createMeal(mealData);
      setMealFoods({ breakfast: [], lunch: [], dinner: [], snack: [] });
      setMealName("");

      if (selectedClient) {
        setMealFoods({ breakfast: [], lunch: [], dinner: [], snack: [] });
        setMealName("");
        setSelectedClient(null);
        setSearchParams({});
      } else if (clientId && clientName) {
        navigate(
          `/clients/${clientId}?name=${encodeURIComponent(clientName)}&trainerClientId=${trainerClientId}`,
        );
      } else {
        navigate(`/meal-plan/${response.meal_plan.id}`);
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      if (error.message?.includes("No authentication token")) {
        alert("Please log in to save meals. Redirecting to login page...");
        window.location.href = "/login";
      } else {
        alert("Failed to save meal. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pt-8 px-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Meal Planner (2/3 width) */}
            <div className="lg:col-span-2 order-1 lg:order-1 bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Meal Planner</h2>
                {role === "trainer" && (
                  <button
                    onClick={() => {
                      setSelectClientModal(true);
                      fetchClients();
                    }}
                    className="p-2 rounded hover:bg-gray-100 text-gray-500 text-2xl font-light"
                  >
                    +
                  </button>
                )}
              </div>

              {(selectedClient || clientName) && (
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-blue-600 font-medium">
                    Creating meal plan for:{" "}
                    {selectedClient
                      ? selectedClient.client_name ||
                        selectedClient.client_email
                      : clientName}
                  </p>
                  {selectedClient && (
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Meal Name Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter meal plan name (e.g., Summer Cut Week 1)"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Meal sections */}
              <div className="space-y-6">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                  (mealType) => (
                    <div key={mealType}>
                      <h3 className="font-semibold text-base text-gray-900 mb-2">
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}:{" "}
                        <span className="font-medium text-gray-600 text-sm">
                          {calculateMealTotal(mealType, "calories").toFixed(0)}{" "}
                          cal ·{" "}
                          {calculateMealTotal(mealType, "protein").toFixed(1)}g
                          protein ·{" "}
                          {calculateMealTotal(mealType, "carbs").toFixed(1)}g
                          carbs ·{" "}
                          {calculateMealTotal(mealType, "fat").toFixed(1)}g fats
                        </span>
                      </h3>
                      <div
                        className={`border-2 border-dashed rounded-lg p-3 min-h-[72px] cursor-pointer transition-colors ${
                          selectedMeal === mealType
                            ? "border-blue-400 bg-blue-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedMeal(mealType)}
                      >
                        {mealFoods[mealType].length === 0 ? (
                          <p className="text-gray-300 text-sm text-center pt-3">
                            Click to select, then add foods from the panel
                          </p>
                        ) : (
                          mealFoods[mealType].map(
                            (food: any, index: number) => (
                              <div
                                key={`${food.id}-${index}`}
                                className="bg-white border border-gray-200 rounded-lg p-3 mb-2 flex justify-between items-start"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 mb-2">
                                    {food.name}
                                  </div>{" "}
                                  <div className="flex items-center gap-1 mb-2">
                                    <input
                                      type="number"
                                      value={Math.round(food.quantity_g)}
                                      onChange={(e) =>
                                        updateFoodServing(
                                          mealType,
                                          index,
                                          e.target.value,
                                        )
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      min="0"
                                    />
                                    <span className="text-sm text-gray-500">
                                      g
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {(
                                      food.calories_per_100g *
                                      (food.quantity_g / 100)
                                    ).toFixed(1)}{" "}
                                    cal ·{" "}
                                    {(
                                      food.protein_per_100g *
                                      (food.quantity_g / 100)
                                    ).toFixed(1)}
                                    g protein ·{" "}
                                    {(
                                      food.carbs_per_100g *
                                      (food.quantity_g / 100)
                                    ).toFixed(1)}
                                    g carbs ·{" "}
                                    {(
                                      food.fat_per_100g *
                                      (food.quantity_g / 100)
                                    ).toFixed(1)}
                                    g fats
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFoodFromMeal(mealType, index);
                                  }}
                                  className="text-gray-300 hover:text-red-400 ml-3 text-lg leading-none"
                                >
                                  ✕
                                </button>
                              </div>
                            ),
                          )
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Footer row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-4 border-t border-gray-100 gap-3">
                <button
                  onClick={handleSaveMeal}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium w-full sm:w-auto"
                >
                  Save Meal
                </button>
                <p className="text-sm text-gray-500 text-center sm:text-right">
                  Total: {calculateGrandTotal("calories").toFixed(0)} cal ·{" "}
                  {calculateGrandTotal("protein").toFixed(1)}g protein ·{" "}
                  {calculateGrandTotal("carbs").toFixed(1)}g carbs ·{" "}
                  {calculateGrandTotal("fat").toFixed(1)}g fats
                </p>
              </div>
            </div>

            {/* Right side - Food panel — hidden on mobile */}
            <div className="hidden lg:block lg:order-2">
              <FoodPanel onFoodClick={addFoodToMeal} />
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Mobile floating Add Food button */}
      <button
        className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg z-40 flex items-center gap-2"
        onClick={() => setFoodDrawerOpen(true)}
      >
        <span className="text-xl font-light">+</span>
        <span className="font-medium">Add Food</span>
      </button>

      {/* Mobile food drawer */}
      {foodDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setFoodDrawerOpen(false)}
          />
          {/* Drawer */}
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

      {selectClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Client</h3>
            <div className="space-y-1 mb-4">
              {clients.map((client: any) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setSelectClientModal(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded"
                >
                  {client.client_name || client.client_email}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setSelectClientModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
