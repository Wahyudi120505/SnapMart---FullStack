import Cookies from "js-cookie";

export const AuthService = {
  login: async (credentials) => {
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      const userData = {
        role: result.data.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      Cookies.set("authToken", result.data.token);

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  verifyEmail: async (email, code) => {
    try {
      const response = await fetch(
        `http://localhost:8080/auth/verify?email=${encodeURIComponent(
          email
        )}&code=${code}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Email verification failed");
      }

      return result;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await fetch(
        "http://localhost:8080/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ||"Forgot password request failed");
      }

      return result;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await fetch(
        "http://localhost:8080/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(resetData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Password reset failed:", result);
        throw new Error(result.message || "Password reset failed");
      }

      return result;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("resetEmail");
    Cookies.remove("authToken");
  },

  isAuthenticated: () => {
    const token = Cookies.get("authToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return !!token && !!user.role;
  },
};
