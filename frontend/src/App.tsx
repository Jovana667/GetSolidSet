import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Meals from "./pages/Meals";
import MealPlanDetail from "./pages/MealPlanDetail";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import SharedMealPlan from "./pages/SharedMealPlan";
import { AuthUtils } from "./utils/auth";
import { AuthProvider } from "./context/AuthContext";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function App() {
  useEffect(() => {
    // Initialize auth checking on app startup
    AuthUtils.initAuthCheck();
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <Meals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute requiredRole="trainer">
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:clientId"
            element={
              <ProtectedRoute requiredRole="trainer">
                <ClientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/meal-plan/:id" element={<MealPlanDetail />} />
          <Route path="/share/:token" element={<SharedMealPlan />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
