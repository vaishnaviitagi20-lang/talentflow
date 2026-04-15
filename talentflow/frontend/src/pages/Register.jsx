import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: params.get("role") || "candidate",
    companyName: "", companyLocation: "", companyWebsite: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.email.trim()) { toast.error("Email is required."); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (form.role === "employer" && !form.companyName.trim()) { toast.error("Company name is required."); return; }
    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        companyName: form.companyName,
        companyLocation: form.companyLocation,
        companyWebsite: form.companyWebsite,
      });
      toast.success(`Welcome to TalentFlow+, ${user.name.split(" ")[0]}!`);
      navigate(user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Join TalentFlow+</h1>
            <p className="text-ink-400">Create your free account in seconds</p>
          </div>

          <div className="card p-8">
            {/* Role selector */}
            <div className="mb-6">
              <label className="label text-center block mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "candidate", label: "Job Seeker", icon: "👤", desc: "Find your dream job" },
                  { value: "employer", label: "Employer", icon: "🏢", desc: "Hire top talent" },
                ].map((r) => (
                  <button key={r.value} type="button" onClick={() => set("role", r.value)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${form.role === r.value ? "border-ink-900 bg-ink-50" : "border-ink-100 hover:border-ink-300 bg-white"}`}>
                    <span className="text-2xl">{r.icon}</span>
                    <span className="font-semibold text-ink-900 text-sm">{r.label}</span>
                    <span className="text-xs text-ink-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Smith" className="input" required />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 6 chars" className="input pr-10" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm *</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Repeat" className="input" required />
                </div>
              </div>

              {form.role === "employer" && (
                <div className="space-y-3 pt-2 border-t border-ink-100">
                  <p className="text-sm font-semibold text-ink-700">Company Details</p>
                  <div>
                    <label className="label">Company Name *</label>
                    <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Corporation" className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Location</label>
                      <input value={form.companyLocation} onChange={(e) => set("companyLocation", e.target.value)} placeholder="New York, USA" className="input" />
                    </div>
                    <div>
                      <label className="label">Website</label>
                      <input value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} placeholder="https://acme.com" className="input" />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : "Create Account →"}
              </button>
            </form>

            <p className="text-center text-sm text-ink-500 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-ink-900 font-semibold hover:text-gold-600 transition-colors">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
