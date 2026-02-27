// Authentication utilities to prevent recurring auth issues

export const AuthUtils = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Basic JWT expiration check (tokens expire in 7 days)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  // Get token safely
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  // Get user info
  getUser(): any | null {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  },

  // Clear authentication
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // Check authentication and redirect if needed
  requireAuth(redirectTo: string = "/login"): boolean {
    if (!this.isAuthenticated()) {
      alert("Please log in to continue");
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  // Auto-redirect if token expires
  initAuthCheck(): void {
    // Check every minute if token is still valid
    setInterval(() => {
      if (
        !this.isAuthenticated() &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        alert("Your session has expired. Please log in again.");
        this.logout();
      }
    }, 60000); // 1 minute
  },
};
