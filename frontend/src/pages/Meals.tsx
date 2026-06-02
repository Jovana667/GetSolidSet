import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMeals, getAssignedMeals, deleteMeal } from "../services/api";
import { Meal } from "../types";
import Navbar from "../components/Navbar";

function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<any[]>([]);
  const [assignedMeals, setAssignedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mealToRemove, setMealToRemove] = useState<any>(null);
  const [mealSelectMode, setMealSelectMode] = useState<"none" | "remove">(
    "none",
  );
  const [mealBulkRemove, setMealBulkRemove] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const data = await getMeals();
        const assignedData = await getAssignedMeals();
        setMeals(data.meals || data);
        setAssignedMeals(assignedData.meals || assignedData);
        setError(null);
      } catch (err) {
        setError("Failed to load meals");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

    const handleRemoveMeal = async () => {
      try {
        await deleteMeal(mealToRemove.id);
const data = await getMeals();
setMeals(data.meals || data);
        setMealToRemove(null);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error removing meal:", error);
        setError("Failed to remove meal. Please try again later.");
      }
    };
  
    const handleBulkRemoveMeals = async () => {
      try {
        await Promise.all(
          mealBulkRemove.map((meal) =>
            deleteMeal(meal.id),
          ),
        );
const data = await getMeals();
setMeals(data.meals || data);
        setMealBulkRemove([]);
        setMealSelectMode("none");
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error removing meals:", error);
        setError("Failed to remove meals. Please try again later.");
      }
    };

return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Navbar />

        {loading && (
          <div className="text-center text-gray-500 py-8">Loading meals...</div>
        )}

        {error && <div className="text-center text-red-500 py-8">{error}</div>}

        {!loading && !error && (
          <>
            {/* Personal Meal Plans Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Meal Plans</h2>
              <div className="flex items-center gap-3">
                {mealSelectMode === "remove" ? (
                  <>
                    <span className="text-sm text-gray-500">
                      {mealBulkRemove.length} selected
                    </span>
                    <button
                      onClick={() => {
                        setMealSelectMode("none");
                        setMealBulkRemove([]);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={mealBulkRemove.length === 0}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6m4-6v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                      Delete ({mealBulkRemove.length})
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setMealSelectMode("remove")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>

            {/* Personal Meal Plans */}
            {meals.length === 0 ? (
              <div className="text-center text-gray-500 py-8 mb-8">
                No saved meals yet. Go build one!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {meals.map((meal: any) => (
                  <div
                    key={meal.id}
                    className={`bg-white rounded-lg shadow p-6 relative ${
                      mealSelectMode === "remove" ? "cursor-pointer" : ""
                    } ${
                      mealBulkRemove.includes(meal) ? "ring-2 ring-red-400" : ""
                    }`}
                    onClick={() => {
                      if (mealSelectMode === "remove") {
                        setMealBulkRemove((prev) =>
                          prev.includes(meal)
                            ? prev.filter((m) => m !== meal)
                            : [...prev, meal]
                        );
                      }
                    }}
                  >
                    {mealSelectMode === "remove" && (
                      <div className="absolute top-4 right-4">
                        <input
                          type="checkbox"
                          checked={mealBulkRemove.includes(meal)}
                          onChange={() => {}}
                          className="w-4 h-4 accent-red-500"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
                    <p className="text-gray-600 mb-4">
                      Created: {new Date(meal.created_at).toLocaleDateString()}
                    </p>
                    {mealSelectMode !== "remove" && (
                      <button
                        onClick={() => navigate(`/meal-plan/${meal.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Assigned Meal Plans */}
            {assignedMeals.length > 0 && (
              <>
                <hr className="border-gray-200 mb-8" />
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Assigned by Trainer
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedMeals.map((meal: any) => (
                    <div key={meal.id} className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
                      <p className="text-gray-600 mb-2">
                        Created: {new Date(meal.created_at).toLocaleDateString()}
                      </p>
                      {meal.assigned_by && (
                        <p className="text-blue-600 text-sm mb-4">
                          Assigned by: {meal.assigned_by}
                        </p>
                      )}
                      <button
                        onClick={() => navigate(`/meal-plan/${meal.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Remove Meal</h3>
              {mealBulkRemove.length > 0 ? (
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove {mealBulkRemove.length} meals?
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove {mealToRemove?.name}?
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={
                    mealBulkRemove.length > 0
                      ? handleBulkRemoveMeals
                      : handleRemoveMeal
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Meals;