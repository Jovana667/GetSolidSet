import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getClientMeals } from "../services/api";

function ClientDetailPage() {
  const { clientId } = useParams();
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get("name");
  const trainerClientId = searchParams.get("trainerClientId");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientMeals = async () => {
      try {
        const data = await getClientMeals(trainerClientId!);
        setMealPlans(data.meals || data);
        setError(null);
      } catch (error: any) {
        if (error.response?.status === 400) {
          // Client has no account — just show empty state
          setMealPlans([]);
          setError(null);
        } else {
          console.error("Error fetching client meals:", error);
          setError(
            "Failed to fetch client's meal plans. Please try again later.",
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClientMeals();
  }, [clientId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with create button always visible */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{clientName}</h1>
            <button
              onClick={() =>
                navigate(
                  `/?clientId=${clientId}&clientName=${encodeURIComponent(clientName || "")}&trainerClientId=${trainerClientId}`,
                )
              }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create Meal Plan
            </button>
          </div>

          {/* Loading / Error / Empty / Meal cards */}
          {loading ? (
            <p>Loading meal plans...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : mealPlans.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No meal plans yet. Create one for this client!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan: any) => (
                <div key={plan.id} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                  <p className="text-gray-600 mb-4">
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/meal-plan/${plan.id}?clientId=${clientId}`)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDetailPage;
