import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/api";

function Navbar() {
  const { isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();
  const navigate = useNavigate();

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
    <header className="flex justify-between items-center mb-8">
      <Link
        to="/"
        className="text-3xl font-bold text-gray-900 hover:text-gray-700"
      >
        Macrology
      </Link>

      <div className="flex items-center space-x-4">
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
    </header>
  );
}

export default Navbar;
