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
    console.log(`Adding ${food.name} to ${selectedMeal}`);
    const foodWithServing = { ...food, serving: 1 }; // Default serving size to 1
    setMealFoods({
      ...mealFoods,
      [selectedMeal]: [
        ...mealFoods[selectedMeal as keyof typeof mealFoods],
        foodWithServing,
      ],
    });
    console.log("Updated mealFoods:", mealFoods);
  };

  const updateFoodServing = (
    mealType: string,
    foodIndex: number,
    newServing: string,
  ) => {
    // Copy the entire mealFoods object
    const updatedMealFoods = { ...mealFoods };

    // Copy the specific meal's array
    const updatedMeal = [...mealFoods[mealType as keyof typeof mealFoods]];

    // Update the specific food at foodIndex
    updatedMeal[foodIndex] = {
      ...updatedMeal[foodIndex],
      serving: parseFloat(newServing) || 0,
    };

    // Update the meal in the mealFoods object
    updatedMealFoods[mealType as keyof typeof mealFoods] = updatedMeal;

    // Set the new state
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
        return total + food[`${metric}_per_100g`] * food.serving;
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
        quantity_g: food.serving * 100,
      })),
      lunch: mealFoods.lunch.map((food) => ({
        food_id: food.id,
        quantity_g: food.serving * 100,
      })),
      dinner: mealFoods.dinner.map((food) => ({
        food_id: food.id,
        quantity_g: food.serving * 100,
      })),
      snack: mealFoods.snack.map((food) => ({
        food_id: food.id,
        quantity_g: food.serving * 100,
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
            <div className="lg:col-span-2 order-2 lg:order-1 bg-white rounded-lg shadow p-6">
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
                <p className="text-blue-600 font-medium mb-4">
                  Creating meal plan for:{" "}
                  {selectedClient
                    ? selectedClient.client_name || selectedClient.client_email
                    : clientName}
                </p>
              )}
              {/* Meal Name Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter meal plan name (e.g., Summer Cut Week 1)"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Placeholder for meal structure */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Breakfast:{" "}
                    {calculateMealTotal("breakfast", "calories").toFixed(1)}{" "}
                    cal, {calculateMealTotal("breakfast", "protein").toFixed(1)}
                    g protein,{" "}
                    {calculateMealTotal("breakfast", "carbs").toFixed(1)}g
                    carbs, {calculateMealTotal("breakfast", "fat").toFixed(1)}g
                    fats
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded p-4 cursor-pointer ${
                      selectedMeal === "breakfast"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 text-gray-400"
                    }`}
                    onClick={() => setSelectedMeal("breakfast")}
                  >
                    {mealFoods.breakfast.length === 0 ? (
                      <p className="text-gray-400">Drop foods here</p>
                    ) : (
                      mealFoods.breakfast.map((food: any, index: number) => (
                        <div
                          key={`${food.id}-${index}`}
                          className="text-sm mb-1 text-gray-800 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{food.name}</div>
                            <input
                              type="number"
                              value={food.serving}
                              onChange={(e) =>
                                updateFoodServing(
                                  "breakfast",
                                  index,
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                            <p>
                              Calories:{" "}
                              {(food.calories_per_100g * food.serving).toFixed(
                                1,
                              )}
                            </p>
                            <p>
                              Protein:{" "}
                              {(food.protein_per_100g * food.serving).toFixed(
                                1,
                              )}
                              g
                            </p>
                            <p>
                              Carbs:{" "}
                              {(food.carbs_per_100g * food.serving).toFixed(1)}g
                            </p>
                            <p>
                              Fats:{" "}
                              {(food.fat_per_100g * food.serving).toFixed(1)}g
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFoodFromMeal("breakfast", index);
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Lunch: {calculateMealTotal("lunch", "calories").toFixed(1)}{" "}
                    cal, {calculateMealTotal("lunch", "protein").toFixed(1)}g
                    protein, {calculateMealTotal("lunch", "carbs").toFixed(1)}g
                    carbs, {calculateMealTotal("lunch", "fat").toFixed(1)}g fats
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded p-4 cursor-pointer ${
                      selectedMeal === "lunch"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 text-gray-400"
                    }`}
                    onClick={() => setSelectedMeal("lunch")}
                  >
                    {mealFoods.lunch.length === 0 ? (
                      <p className="text-gray-400">Drop foods here</p>
                    ) : (
                      mealFoods.lunch.map((food: any, index: number) => (
                        <div
                          key={`${food.id}-${index}`}
                          className="text-sm mb-1 text-gray-800 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{food.name}</div>
                            <input
                              type="number"
                              value={food.serving}
                              onChange={(e) =>
                                updateFoodServing(
                                  "lunch",
                                  index,
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                            <p>
                              Calories:{" "}
                              {(food.calories_per_100g * food.serving).toFixed(
                                1,
                              )}
                            </p>
                            <p>
                              Protein:{" "}
                              {(food.protein_per_100g * food.serving).toFixed(
                                1,
                              )}
                              g
                            </p>
                            <p>
                              Carbs:{" "}
                              {(food.carbs_per_100g * food.serving).toFixed(1)}g
                            </p>
                            <p>
                              Fats:{" "}
                              {(food.fat_per_100g * food.serving).toFixed(1)}g
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFoodFromMeal("lunch", index);
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Dinner:{" "}
                    {calculateMealTotal("dinner", "calories").toFixed(1)} cal,{" "}
                    {calculateMealTotal("dinner", "protein").toFixed(1)}g
                    protein, {calculateMealTotal("dinner", "carbs").toFixed(1)}g
                    carbs, {calculateMealTotal("dinner", "fat").toFixed(1)}g
                    fats
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded p-4 cursor-pointer ${
                      selectedMeal === "dinner"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 text-gray-400"
                    }`}
                    onClick={() => setSelectedMeal("dinner")}
                  >
                    {mealFoods.dinner.length === 0 ? (
                      <p className="text-gray-400">Drop foods here</p>
                    ) : (
                      mealFoods.dinner.map((food: any, index: number) => (
                        <div
                          key={`${food.id}-${index}`}
                          className="text-sm mb-1 text-gray-800 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{food.name}</div>
                            <input
                              type="number"
                              value={food.serving}
                              onChange={(e) =>
                                updateFoodServing(
                                  "dinner",
                                  index,
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                            <p>
                              Calories:{" "}
                              {(food.calories_per_100g * food.serving).toFixed(
                                1,
                              )}
                            </p>
                            <p>
                              Protein:{" "}
                              {(food.protein_per_100g * food.serving).toFixed(
                                1,
                              )}
                              g
                            </p>
                            <p>
                              Carbs:{" "}
                              {(food.carbs_per_100g * food.serving).toFixed(1)}g
                            </p>
                            <p>
                              Fats:{" "}
                              {(food.fat_per_100g * food.serving).toFixed(1)}g
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFoodFromMeal("dinner", index);
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Snack: {calculateMealTotal("snack", "calories").toFixed(1)}{" "}
                    cal, {calculateMealTotal("snack", "protein").toFixed(1)}g
                    protein, {calculateMealTotal("snack", "carbs").toFixed(1)}g
                    carbs, {calculateMealTotal("snack", "fat").toFixed(1)}g fats
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded p-4 cursor-pointer ${
                      selectedMeal === "snack"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 text-gray-400"
                    }`}
                    onClick={() => setSelectedMeal("snack")}
                  >
                    {mealFoods.snack.length === 0 ? (
                      <p className="text-gray-400">Drop foods here</p>
                    ) : (
                      mealFoods.snack.map((food: any, index: number) => (
                        <div
                          key={`${food.id}-${index}`}
                          className="text-sm mb-1 text-gray-800 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{food.name}</div>
                            <input
                              type="number"
                              value={food.serving}
                              onChange={(e) =>
                                updateFoodServing(
                                  "snack",
                                  index,
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                            <p>
                              Calories:{" "}
                              {(food.calories_per_100g * food.serving).toFixed(
                                1,
                              )}
                            </p>
                            <p>
                              Protein:{" "}
                              {(food.protein_per_100g * food.serving).toFixed(
                                1,
                              )}
                              g
                            </p>
                            <p>
                              Carbs:{" "}
                              {(food.carbs_per_100g * food.serving).toFixed(1)}g
                            </p>
                            <p>
                              Fats:{" "}
                              {(food.fat_per_100g * food.serving).toFixed(1)}g
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFoodFromMeal("snack", index);
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={handleSaveMeal}
                  className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Save Meal
                </button>
                {/* Grand Total */}
                <div className="mt-6 pt-6 ">
                  <h3 className="font-semibold text-lg">
                    Calories: {calculateGrandTotal("calories").toFixed(1)} cal,
                    Protein: {calculateGrandTotal("protein").toFixed(1)}g,
                    Carbs: {calculateGrandTotal("carbs").toFixed(1)}g, Fats:{" "}
                    {calculateGrandTotal("fat").toFixed(1)}g
                  </h3>
                </div>
              </div>
            </div>

            {/* Right side - Food Sidebar (1/3 width) */}
            <FoodPanel onFoodClick={addFoodToMeal} />
          </div>
        </div>
      </div>
      <Footer />
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
