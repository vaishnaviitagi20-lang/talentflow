import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CompanyProfile from "./pages/CompanyProfile";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import CompanySettings from "./pages/CompanySettings";
import NotFound from "./pages/NotFound";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-ink-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-ink-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (user) return <Navigate to={user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard"} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/companies/:id" element={<CompanyProfile />} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/candidate/dashboard" element={
        <PrivateRoute role="candidate"><CandidateDashboard /></PrivateRoute>
      } />

      <Route path="/employer/dashboard" element={
        <PrivateRoute role="employer"><EmployerDashboard /></PrivateRoute>
      } />
      <Route path="/employer/post-job" element={
        <PrivateRoute role="employer"><PostJob /></PrivateRoute>
      } />
      <Route path="/employer/jobs/:id/edit" element={
        <PrivateRoute role="employer"><EditJob /></PrivateRoute>
      } />
      <Route path="/employer/company-settings" element={
        <PrivateRoute role="employer"><CompanySettings /></PrivateRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "Outfit, sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              background: "#1a1a2e",
              color: "#fff",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
