import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  initialized: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true };
    case "CLEAR_USER":
      return { ...state, user: null, token: null, loading: false, initialized: true };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    const userStr = localStorage.getItem("tf_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: "SET_USER", payload: { user, token } });
        // Verify token is still valid
        api.get("/auth/me")
          .then(({ data }) => {
            dispatch({ type: "SET_USER", payload: { user: data.user, token } });
            localStorage.setItem("tf_user", JSON.stringify(data.user));
          })
          .catch(() => {
            localStorage.removeItem("tf_token");
            localStorage.removeItem("tf_user");
            dispatch({ type: "CLEAR_USER" });
          });
      } catch {
        dispatch({ type: "CLEAR_USER" });
      }
    } else {
      dispatch({ type: "CLEAR_USER" });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
    dispatch({ type: "SET_USER", payload: { user: data.user, token: data.token } });
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
    dispatch({ type: "SET_USER", payload: { user: data.user, token: data.token } });
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    dispatch({ type: "CLEAR_USER" });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: "UPDATE_USER", payload: updates });
    const current = JSON.parse(localStorage.getItem("tf_user") || "{}");
    localStorage.setItem("tf_user", JSON.stringify({ ...current, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
