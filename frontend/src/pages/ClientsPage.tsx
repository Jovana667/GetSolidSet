import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getClients, addClient, removeClient } from "../services/api";

function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientToRemove, setClientToRemove] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [clientSelectMode, setClientSelectMode] = useState<"none" | "remove">(
    "none",
  );
  const [clientBulkRemove, setClientBulkRemove] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        setError(null);
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

  const handleRemoveClient = async () => {
    if (isRemoving) return; // guard against double-fire
    setIsRemoving(true);
    try {
      await removeClient(clientToRemove.trainer_client_id);
      const data = await getClients();
      setClients(data);
      setClientToRemove(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error removing client:", error);
      setError("Failed to remove client. Please try again later.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBulkRemoveClients = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await Promise.all(
        clientBulkRemove.map((client) =>
          removeClient(client.trainer_client_id),
        ),
      );
      const data = await getClients();
      setClients(data);
      setClientBulkRemove([]);
      setClientSelectMode("none");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error removing clients:", error);
      setError("Failed to remove clients. Please try again later.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <div className="flex items-center gap-3">
              {clientSelectMode === "remove" ? (
                <>
                  <span className="text-sm text-gray-500">
                    {clientBulkRemove.length} selected
                  </span>
                  <button
                    onClick={() => {
                      setClientSelectMode("none");
                      setClientBulkRemove([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={clientBulkRemove.length === 0}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6m4-6v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                    Delete ({clientBulkRemove.length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setClientSelectMode("remove")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => {
                      setIsAddClientModalOpen(true);
                      setModalError(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    + Add Client
                  </button>
                </>
              )}
            </div>
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
                <div
                  key={client.id}
                  className={`bg-white rounded-lg shadow p-6 relative ${
                    clientSelectMode === "remove" ? "cursor-pointer" : ""
                  } ${
                    clientBulkRemove.includes(client)
                      ? "ring-2 ring-red-400"
                      : ""
                  }`}
                  onClick={() => {
                    if (clientSelectMode === "remove") {
                      setClientBulkRemove((prev) =>
                        prev.includes(client)
                          ? prev.filter((c) => c !== client)
                          : [...prev, client],
                      );
                    }
                  }}
                >
                  {/* Checkbox in selection mode */}
                  {clientSelectMode === "remove" && (
                    <div className="absolute top-4 right-4">
                      <input
                        type="checkbox"
                        checked={clientBulkRemove.includes(client)}
                        onChange={() => {}}
                        className="w-4 h-4 accent-red-500"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">
                    {client.client_name || client.email}
                  </h3>
<p className="text-gray-600 mb-4">{client.email || client.client_email}</p>                  {clientSelectMode !== "remove" && (
                    <button
                      onClick={() =>
                        navigate(
                          `/clients/${client.id}?name=${encodeURIComponent(
                            client.client_name || client.email || "Client",
                          )}&trainerClientId=${client.trainer_client_id}`,
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  )}
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
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Client</h3>
            <input
              type="text"
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mb-4">
              Enter email only if client has a GetSolidSet account
            </p>
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Remove Client</h3>
            {clientBulkRemove.length > 0 ? (
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove {clientBulkRemove.length}{" "}
                clients?
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove{" "}
                {clientToRemove?.client_name || clientToRemove?.email}?
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
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isRemoving}
                onClick={
                  clientBulkRemove.length > 0
                    ? handleBulkRemoveClients
                    : handleRemoveClient
                }
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;
