import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../utils/api";
import { JOB_FIELDS, JOB_TYPES, EXPERIENCE_LEVELS } from "../utils/constants";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then(({ data }) => {
        const job = data.job;
        setForm({
          title: job.title || "",
          description: job.description || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          location: job.location || "",
          isRemote: job.isRemote || false,
          jobType: job.jobType || "Full-time",
          field: job.field || "IT",
          experienceLevel: job.experienceLevel || "Mid",
          salaryMin: job.salary?.min || "",
          salaryMax: job.salary?.max || "",
          salaryDisplay: job.salary?.display || "",
          skills: (job.skills || []).join(", "),
          deadline: job.deadline ? job.deadline.split("T")[0] : "",
          isActive: job.isActive !== false,
        });
      })
      .catch(() => {
        toast.error("Job not found.");
        navigate("/employer/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.description.trim()) { toast.error("Description is required."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      await api.put(`/jobs/${id}`, payload);
      toast.success("Job updated successfully!");
      navigate("/employer/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update job.");
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
          <h1 className="font-display text-3xl font-bold mb-1">Edit Job Posting</h1>
          <p className="text-ink-300">Update the details of your job listing.</p>
        </div>
      </div>

      <div className="page-container py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="card p-7 space-y-5">
            <h2 className="font-semibold text-ink-900 text-lg">Basic Information</h2>

            <div>
              <label className="label">Job Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className="input" required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Field *</label>
                <select value={form.field} onChange={(e) => set("field", e.target.value)} className="select">
                  {JOB_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Job Type *</label>
                <select value={form.jobType} onChange={(e) => set("jobType", e.target.value)} className="select">
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Location *</label>
                <input value={form.location} onChange={(e) => set("location", e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} className="select">
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isRemote} onChange={(e) => set("isRemote", e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-ink-700">Remote position</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-ink-700">Active (visible to candidates)</span>
              </label>
            </div>
          </div>

          {/* Compensation */}
          <div className="card p-7 space-y-4">
            <h2 className="font-semibold text-ink-900 text-lg">Compensation</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Min Salary ($)</label>
                <input type="number" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="60000" className="input" />
              </div>
              <div>
                <label className="label">Max Salary ($)</label>
                <input type="number" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="80000" className="input" />
              </div>
              <div>
                <label className="label">Display Text</label>
                <input value={form.salaryDisplay} onChange={(e) => set("salaryDisplay", e.target.value)} placeholder="$60k–$80k/yr" className="input" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card p-7 space-y-5">
            <h2 className="font-semibold text-ink-900 text-lg">Job Details</h2>

            <div>
              <label className="label">Description *</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} className="input resize-none" required />
            </div>

            <div>
              <label className="label">Requirements</label>
              <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)} rows={4} className="input resize-none" />
            </div>

            <div>
              <label className="label">Responsibilities</label>
              <textarea value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} rows={4} className="input resize-none" />
            </div>

            <div>
              <label className="label">Skills (comma separated)</label>
              <input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, MongoDB" className="input" />
            </div>

            <div>
              <label className="label">Application Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="input" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-gold py-3 px-8 text-base">
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
            <button type="button" onClick={() => navigate("/employer/dashboard")} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
