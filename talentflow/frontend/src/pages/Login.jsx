import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-ink-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Welcome back</h1>
            <p className="text-ink-400">Sign in to your TalentFlow+ account</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input pr-11"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 p-1">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3 text-base mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-ink-400">or</span></div>
            </div>

            <p className="text-center text-sm text-ink-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-ink-900 font-semibold hover:text-gold-600 transition-colors">Create one →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
