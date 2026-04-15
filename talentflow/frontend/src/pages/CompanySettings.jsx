import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { COMPANY_SIZES, getInitials } from "../utils/constants";

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Manufacturing",
  "Retail & E-commerce", "Education", "Consulting", "Media & Entertainment",
  "Real Estate", "Logistics", "Energy", "Other",
];

export default function CompanySettings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        const company = data.user?.company;
        if (!company) {
          toast.error("No company profile found.");
          navigate("/employer/dashboard");
          return;
        }
        setCompanyId(company._id);
        setForm({
          name: company.name || "",
          about: company.about || "",
          website: company.website || "",
          location: company.location || "",
          contactEmail: company.contactEmail || "",
          industry: company.industry || "",
          size: company.size || "",
          logo: company.logo || "",
          founded: company.founded || "",
        });
      })
      .catch(() => toast.error("Failed to load company data."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Company name is required."); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/companies/${companyId}`, form);
      updateUser({ company: data.company });
      toast.success("Company profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-ink-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      <div className="bg-ink-900 text-white py-10">
        <div className="page-container max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-1">Company Settings</h1>
          <p className="text-ink-300">
            Keep your company profile complete to attract the best candidates.
          </p>
        </div>
      </div>

      <div className="page-container py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preview */}
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-ink-100 border-2 border-ink-200 flex items-center justify-center text-xl font-bold text-ink-600 overflow-hidden">
                {form.logo ? (
                  <img src={form.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(form.name || "?")
                )}
              </div>
              <div>
                <p className="font-semibold text-ink-900 text-lg">{form.name || "Your Company"}</p>
                <p className="text-sm text-ink-400">{form.industry || "Industry not set"} · {form.location || "Location not set"}</p>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="card p-7 space-y-5">
            <h2 className="font-semibold text-ink-900 text-lg">Company Identity</h2>

            <div>
              <label className="label">Company Name *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Acme Corporation"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">About the Company</label>
              <textarea
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
                placeholder="Describe your company, culture, mission, and what makes you unique as an employer..."
                rows={5}
                className="input resize-none"
              />
              <p className="text-xs text-ink-400 mt-1">{form.about.length}/2000 characters</p>
            </div>

            <div>
              <label className="label">Logo URL</label>
              <input
                value={form.logo}
                onChange={(e) => set("logo", e.target.value)}
                placeholder="https://yourcompany.com/logo.png"
                className="input"
              />
              <p className="text-xs text-ink-400 mt-1">Paste a direct image URL for your company logo</p>
            </div>
          </div>

          {/* Details */}
          <div className="card p-7 space-y-5">
            <h2 className="font-semibold text-ink-900 text-lg">Details & Contact</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Industry</label>
                <select value={form.industry} onChange={(e) => set("industry", e.target.value)} className="select">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Company Size</label>
                <select value={form.size} onChange={(e) => set("size", e.target.value)} className="select">
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Headquarters Location</label>
                <input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="New York, USA"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Founded Year</label>
                <input
                  value={form.founded}
                  onChange={(e) => set("founded", e.target.value)}
                  placeholder="2015"
                  className="input"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="input"
                  type="url"
                />
              </div>
              <div>
                <label className="label">Contact Email</label>
                <input
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  placeholder="hiring@yourcompany.com"
                  className="input"
                  type="email"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-gold py-3 px-8 text-base">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : "💾 Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              className="btn-ghost"
            >
              Cancel
            </button>
            {companyId && (
              <a
                href={`/companies/${companyId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline text-sm ml-auto"
              >
                👁️ View Public Profile
              </a>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
