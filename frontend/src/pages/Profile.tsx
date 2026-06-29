import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  changePassword,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Profile() {
  const { role, setIsLoggedIn, setRole } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileDeleted, setProfileDeleted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setFormData({ name: data.name || "", email: data.email || "" });
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    setLoading(true);
    try {
      await deleteUserProfile();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setIsLoggedIn(false);
      setRole(null);
      navigate("/");
    } catch (err) {
      setError("Failed to delete profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  if (profileDeleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-green-600">Profile deleted successfully.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Navbar />

          {/* Account Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Account Details</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800">
                    {profile?.name || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800">
                    {profile?.email || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800 capitalize">
                  {role || "—"}
                </p>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile?.name || "",
                        email: profile?.email || "",
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {!isEditing && (
                <div>
                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change password
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow p-6 mt-6 border border-red-100">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-500 max-w-lg">
                Once you delete your account, all your personal meal plans will
                be permanently removed. This action cannot be undone.
              </p>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-red-600 hover:text-red-800 text-sm font-medium underline shrink-0 ml-4"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone. Your meal plans will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteProfile}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>

            {passwordSuccess ? (
              <p className="text-green-600 text-sm mb-4">
                Password changed successfully.
              </p>
            ) : (
              <div className="space-y-3">
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min 8 chars, 1 number, 1 special character"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordError("");
                  setPasswordSuccess(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                {passwordSuccess ? "Close" : "Cancel"}
              </button>
              {!passwordSuccess && (
                <button
                  disabled={passwordLoading}
                  onClick={async () => {
                    setPasswordError("");
                    if (
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    ) {
                      setPasswordError("Passwords do not match");
                      return;
                    }
                    setPasswordLoading(true);
                    try {
                      await changePassword(
                        passwordForm.currentPassword,
                        passwordForm.newPassword,
                      );
                      setPasswordSuccess(true);
                    } catch (err: any) {
                      setPasswordError(
                        err.response?.data?.error ||
                          "Failed to change password",
                      );
                    } finally {
                      setPasswordLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-60"
                >
                  {passwordLoading ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Profile;
