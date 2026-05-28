import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMeals, getAssignedMeals } from "../services/api";
import { Meal } from "../types";
import Navbar from "../components/Navbar";

function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<any[]>([]);
  const [assignedMeals, setAssignedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            {/* Personal Meal Plans */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Meal Plans</h2>
            {meals.length === 0 ? (
              <div className="text-center text-gray-500 py-8 mb-8">
                No saved meals yet. Go build one!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {meals.map((meal: any) => (
                  <div key={meal.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
                    <p className="text-gray-600 mb-4">
                      Created: {new Date(meal.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => navigate(`/meal-plan/${meal.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
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
      </div>
    </div>
  );
}

export default Meals;
