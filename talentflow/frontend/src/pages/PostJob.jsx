import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../utils/api";
import { JOB_FIELDS, JOB_TYPES, EXPERIENCE_LEVELS } from "../utils/constants";

const EMPTY_FORM = {
  title: "",
  description: "",
  requirements: "",
  responsibilities: "",
  location: "",
  isRemote: false,
  jobType: "Full-time",
  field: "IT",
  experienceLevel: "Mid",
  salaryMin: "",
  salaryMax: "",
  salaryDisplay: "",
  skills: "",
  deadline: "",
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Job title is required."); return; }
    if (!form.description.trim()) { toast.error("Description is required."); return; }
    if (!form.location.trim()) { toast.error("Location is required."); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await api.post("/jobs", payload);
      toast.success("Job posted successfully! 🎉");
      navigate("/employer/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "input";
  const labelCls = "label";

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      <div className="bg-ink-900 text-white py-10">
        <div className="page-container max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-1">Post a New Job</h1>
          <p className="text-ink-300">Reach thousands of qualified candidates across all fields.</p>

          {/* Step indicators */}
          <div className="flex items-center gap-3 mt-6">
            {[
              { n: 1, label: "Basic Info" },
              { n: 2, label: "Compensation" },
              { n: 3, label: "Details" },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step >= n ? "bg-gold-400 text-ink-950" : "bg-white/20 text-white"
                  }`}
                >
                  {n}
                </div>
                <span className={`text-sm ${step >= n ? "text-white" : "text-ink-400"}`}>{label}</span>
                {n < 3 && <div className={`w-8 h-px ${step > n ? "bg-gold-400" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="card p-7 space-y-5 animate-fade-up">
              <h2 className="font-semibold text-ink-900 text-lg">Basic Information</h2>

              <div>
                <label className={labelCls}>Job Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Field / Category *</label>
                  <select value={form.field} onChange={(e) => set("field", e.target.value)} className="select">
                    {JOB_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Job Type *</label>
                  <select value={form.jobType} onChange={(e) => set("jobType", e.target.value)} className="select">
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Location *</label>
                  <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="New York, USA"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Experience Level</label>
                  <select value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} className="select">
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => set("isRemote", !form.isRemote)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isRemote ? "bg-jade-500" : "bg-ink-200"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isRemote ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-ink-700 group-hover:text-ink-900 transition-colors">
                  This is a remote position
                </span>
              </label>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-primary px-8">
                  Next: Compensation →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Compensation */}
          {step === 2 && (
            <div className="card p-7 space-y-5 animate-fade-up">
              <h2 className="font-semibold text-ink-900 text-lg">Compensation</h2>
              <p className="text-sm text-ink-400 -mt-2">
                Transparent salary info attracts 3× more applicants.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Min Salary ($)</label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => set("salaryMin", e.target.value)}
                    placeholder="60000"
                    className={inputCls}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Salary ($)</label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => set("salaryMax", e.target.value)}
                    placeholder="80000"
                    className={inputCls}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelCls}>Display Text</label>
                  <input
                    value={form.salaryDisplay}
                    onChange={(e) => set("salaryDisplay", e.target.value)}
                    placeholder="$60k–$80k/yr"
                    className={inputCls}
                  />
                  <p className="text-xs text-ink-400 mt-1">Overrides numbers above</p>
                </div>
              </div>

              {form.salaryMin && form.salaryMax && (
                <div className="bg-jade-50 border border-jade-200 rounded-xl px-4 py-3 text-sm text-jade-700">
                  ✓ Salary range: ${Number(form.salaryMin).toLocaleString()} – ${Number(form.salaryMax).toLocaleString()} / year
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost">← Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary px-8">
                  Next: Details →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="card p-7 space-y-5 animate-fade-up">
              <h2 className="font-semibold text-ink-900 text-lg">Job Details</h2>

              <div>
                <label className={labelCls}>Job Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the role, the team, what success looks like, and why candidates should be excited..."
                  rows={6}
                  className={`${inputCls} resize-none`}
                  required
                />
                <p className="text-xs text-ink-400 mt-1">{form.description.length} characters</p>
              </div>

              <div>
                <label className={labelCls}>Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                  placeholder="• 3+ years of relevant experience&#10;• Strong communication skills&#10;• Bachelor's degree or equivalent"
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Responsibilities</label>
                <textarea
                  value={form.responsibilities}
                  onChange={(e) => set("responsibilities", e.target.value)}
                  placeholder="• Lead architecture decisions&#10;• Mentor junior engineers&#10;• Ship features used by millions"
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Required Skills</label>
                <input
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  placeholder="React, Node.js, MongoDB, TypeScript (comma separated)"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Application Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className={inputCls}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-ghost">← Back</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold py-3 px-10 text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publishing...
                    </span>
                  ) : "🚀 Publish Job"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  );
}
