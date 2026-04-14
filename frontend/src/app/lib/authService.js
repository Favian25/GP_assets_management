import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 jam dalam milidetik

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      setAuthToken(response.data.token, response.data.user, response.data.loginAt);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginAt");
  }
};

export const setAuthToken = (token, user, loginAt) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loginAt", String(loginAt || Date.now()));
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    // Cek apakah session expired
    if (isSessionExpired()) {
      logoutUser();
      return null;
    }
    return localStorage.getItem("token");
  }
  return null;
};

export const getUserContext = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
  }
  return null;
};

export const isSessionExpired = () => {
  if (typeof window !== "undefined") {
    const loginAt = localStorage.getItem("loginAt");
    if (!loginAt) return false; // Jika tidak ada loginAt, biarkan token valid (backward compat)
    const elapsed = Date.now() - parseInt(loginAt, 10);
    return elapsed > SESSION_DURATION;
  }
  return false;
};

// Update user context di localStorage (setelah edit profil)
export const updateUserContext = (updates) => {
  if (typeof window !== "undefined") {
    const current = getUserContext();
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
    }
  }
};
