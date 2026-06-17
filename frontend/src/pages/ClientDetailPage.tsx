import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SkinFoldsTable, { SkinFoldEntry } from "../components/SkinFoldsTable";
import { getClientMeals, linkClient, getSkinFolds } from "../services/api";
import Footer from "../components/Footer";

function ClientDetailPage() {
  const { clientId } = useParams();
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [linkClientModal, setLinkClientModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [skinFolds, setSkinFolds] = useState<SkinFoldEntry[]>([]);
  const [activeTab, setActiveTab] = useState<
    "mealPlans" | "skinFolds" | "notes"
  >("mealPlans");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);
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

  // Find this block in ClientDetailPage and update the dependency array:
  useEffect(() => {
    if (activeTab !== "skinFolds" || !trainerClientId) return;

    const fetchSkinFolds = async () => {
      try {
        const data = await getSkinFolds(trainerClientId);
        setSkinFolds(data);
        console.log("Fetched skin folds:", data);
      } catch (error: any) {
        console.error("Error fetching skin folds:", error);
      }
    };

    fetchSkinFolds();
  }, [activeTab, trainerClientId]);

  const handleLinkClient = async () => {
    try {
      await linkClient(trainerClientId!, linkEmail);
      setLinkClientModal(false);
      setLinkEmail("");
      setLinkError(null);
      setLinkSuccess(true);
      setLinkClientModal(false);
    } catch (error: any) {
      setLinkError(
        error.response?.data?.error ||
          "Failed to link client. Please check the email and try again.",
      );
    }
  };

  const refreshSkinFolds = async () => {
    const data = await getSkinFolds(trainerClientId!);
    setSkinFolds(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{clientName}</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLinkClientModal(true);
                  setLinkError(null);
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                Link Account
              </button>
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
          </div>

          {linkSuccess && (
            <p className="text-green-600 text-sm mb-4">
              ✓ Account linked successfully
            </p>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("mealPlans")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === "mealPlans"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Meal Plans
            </button>
            <button
              onClick={() => setActiveTab("skinFolds")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === "skinFolds"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Skin Folds
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === "notes"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Notes
            </button>
          </div>

          {/* Meal Plans Tab */}
          {activeTab === "mealPlans" && (
            <>
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
                    <div
                      key={plan.id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <h2 className="text-xl font-semibold mb-2">
                        {plan.name}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Created:{" "}
                        {new Date(plan.created_at).toLocaleDateString()}
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
            </>
          )}

          {activeTab === "skinFolds" && (
            <SkinFoldsTable
              skinFolds={skinFolds}
              trainerClientId={trainerClientId!}
              onEntryCreated={refreshSkinFolds}
              onEntryUpdated={refreshSkinFolds}
            />
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Notes coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Link Account Modal */}
      {linkClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Link Account</h3>
            <p className="text-gray-600 mb-4">
              Enter the registered email for{" "}
              <span className="font-medium">{clientName}</span>
            </p>
            <input
              type="email"
              placeholder="Client's registered email"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {linkError && (
              <p className="text-red-500 text-sm mb-2">{linkError}</p>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setLinkClientModal(false);
                  setLinkEmail("");
                  setLinkError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleLinkClient}
              >
                Link Account
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default ClientDetailPage;
