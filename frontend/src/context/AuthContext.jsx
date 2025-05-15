import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "../services/api";
import { message, notification } from "antd";
import warning from "antd/es/_util/warning";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state
  const [messageApi, contextHolderMessages] = message.useMessage();
  const [notificationApi, contextHolderNotifications] =
    notification.useNotification();
  const [loading, setLoading] = useState(true);

  const createNotification = (type, message) => {
    const typeMapper = {
      info: notificationApi.info,
      success: notificationApi.success,
      error: notificationApi.error,
      warning: notificationApi.warning,
    };

    typeMapper[type]({
      message: `🔔 New Notification`,
      description: message,
    });
  };

  // Function to validate the token and fetch user data
  const initializeAuth = async () => {
    const token = Cookies.get("token"); // Retrieve the token from cookies
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/validate-token", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User Set: ", response.data.user);
      setUser(response.data.user); // Set user data from response
      setLoading(false);
    } catch (err) {
      console.error("Token validation failed:", err);
      setUser(null); // Clear user state on error
      Cookies.remove("token"); // Remove invalid token
      window.location.href = "/";
    }
  };

  useEffect(() => {
    initializeAuth(); // Run token validation on app load
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { user } = response.data;

      // Set user state
      setUser(user);
      Cookies.set("token", response.data.token);
      return { success: true, role: user.role, user: user };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loading, messageApi, createNotification }}
    >
      {contextHolderMessages}
      {contextHolderNotifications}
      {children}
    </AuthContext.Provider>
  );
};
