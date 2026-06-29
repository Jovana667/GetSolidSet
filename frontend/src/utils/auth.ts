export const AuthUtils = {
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getUser(): any | null {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  requireAuth(redirectTo: string = "/login"): boolean {
    if (!this.isAuthenticated()) {
      alert("Please log in to continue");
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  initAuthCheck(): void {
    const publicRoutes = ["/login", "/register", "/reset-password"];

    setInterval(() => {
      if (
        !this.isAuthenticated() &&
        !publicRoutes.includes(window.location.pathname)
      ) {
        alert("Your session has expired. Please log in again.");
        this.logout();
      }
    }, 60000);
  },
};