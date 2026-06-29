import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/api";

function Navbar() {
  const { isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await logoutUser(refreshToken);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/");
  };

  return (
    <header className="mb-8">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-bold text-gray-900 hover:text-gray-700"
        >
          Macrology
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Home
          </Link>
          {isLoggedIn && (
            <Link to="/profile" className="text-blue-600 hover:text-blue-800">
              Profile
            </Link>
          )}
          {role === "trainer" && (
            <Link to="/clients" className="text-blue-600 hover:text-blue-800">
              Clients
            </Link>
          )}
          {isLoggedIn && (
            <Link to="/meals" className="text-blue-600 hover:text-blue-800">
              Saved Meals
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button — visible on mobile only */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            // X icon when open
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // Hamburger icon when closed
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-50"
          >
            Home
          </Link>
          {isLoggedIn && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-50"
            >
              Profile
            </Link>
          )}
          {role === "trainer" && (
            <Link
              to="/clients"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-50"
            >
              Clients
            </Link>
          )}
          {isLoggedIn && (
            <Link
              to="/meals"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-50"
            >
              Saved Meals
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 font-medium"
            >
              Log Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-50"
              >
                Login
              </Link>
              <div className="px-4 py-2">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
