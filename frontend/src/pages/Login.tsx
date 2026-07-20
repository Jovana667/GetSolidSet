import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { forgotPassword, login, verifyOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsLoggedIn, setRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await login(email, password);
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("role", response.user.role);
        localStorage.setItem("user", JSON.stringify(response.user));
        setIsLoggedIn(true);
        setRole(response.user.role);
        navigate("/");
      } else {
        alert("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const resetModal = () => {
    setForgotPasswordModal(false);
    setOtpSent(false);
    setEnteredEmail("");
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
            <p>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </Link>
            </p>
            <p>
              Forgot your password?{" "}
              <button
                onClick={() => setForgotPasswordModal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset it
              </button>
            </p>
          </div>
        </div>
        {/* Forgot Password Modal */}
        {forgotPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">
                {otpSent ? "Enter OTP" : "Reset Password"}
              </h3>

              {!otpSent ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your email to receive a one-time password.
                  </p>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    placeholder="you@example.com"
                    value={enteredEmail}
                    onChange={(e) => setEnteredEmail(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setForgotPasswordModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={resetLoading}
                      onClick={async () => {
                        setResetLoading(true);
                        try {
                          await forgotPassword(enteredEmail);
                          setOtpSent(true);
                        } catch (error) {
                          alert("Failed to send OTP. Please try again.");
                        } finally {
                          setResetLoading(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the OTP sent to {enteredEmail}.
                  </p>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setOtpSent(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await verifyOTP(enteredEmail, otp);
                          resetModal();
                          navigate(
                            `/reset-password?email=${encodeURIComponent(enteredEmail)}`,
                          );
                        } catch (error) {
                          alert("Invalid or expired OTP. Please try again.");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Verify OTP
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Login;
