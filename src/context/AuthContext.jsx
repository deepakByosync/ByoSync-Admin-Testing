import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { env } from "../utils/config.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to verify auth by calling a protected endpoint
      const response = await axios.get(`${env.BASE_URL}/admin/admin-stats`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // If the request fails, user is not authenticated
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${env.BASE_URL}/admin/admin-login`,
        { email, password },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setIsAuthenticated(true);
        return { success: true, message: "Login Successful!" };
      }
      return { success: false, message: response.data?.message || "Login failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Something went wrong!",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${env.BASE_URL}/admin/admin-logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

