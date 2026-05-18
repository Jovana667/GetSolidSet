import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getClients, addClient } from "../services/api";

function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        setError(null); // ← add this
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to fetch clients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddClient = async () => {
    try {
      await addClient(clientEmail, clientName);
      const data = await getClients();
      setClients(data);
      setIsAddClientModalOpen(false);
      setClientEmail("");
      setClientName("");
      setModalError(null);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setModalError("This client is already added to your account.");
      } else if (error.response?.status === 404) {
        setModalError(
          "No account found with that email. Ask your client to register first.",
        );
      } else {
        setModalError("Failed to add client. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />

          {/* Header with Add Client button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <button
              onClick={() => {
                setIsAddClientModalOpen(true);
                setModalError(null);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Client
            </button>
          </div>

          {/* Loading / Error / Empty states */}
          {loading && (
            <div className="text-center text-gray-500 py-8">
              Loading clients...
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 py-8">{error}</div>
          )}
          {!loading && !error && clients.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No clients yet. Add your first client!
            </div>
          )}

          {/* Client cards */}
          {!loading && !error && clients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client: any) => (
                <div key={client.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {client.client_name || client.email}
                  </h3>{" "}
                  <p className="text-gray-600 mb-4">{client.email}</p>
                  <button
                    onClick={() =>
                      navigate(
                        `/clients/${client.id}?name=${encodeURIComponent(client.client_name || client.email || "Client")}&trainerClientId=${client.trainer_client_id}`,
                      )
                    } className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          .
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Client</h3>
            <input
              type="text"
              placeholder="Client name (optional)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Client email address"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {modalError && (
              <p className="text-red-500 text-sm mb-4">{modalError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setIsAddClientModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddClient}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;
