import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { timeAgo, getInitials, FIELD_ICONS } from "../utils/constants";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .get("/jobs/employer/my")
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => toast.error("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (job) => {
    try {
      await api.put(`/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs((prev) =>
        prev.map((j) => j._id === job._id ? { ...j, isActive: !j.isActive } : j)
      );
      toast.success(job.isActive ? "Job deactivated." : "Job activated.");
    } catch {
      toast.error("Failed to update job.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this job posting?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success("Job deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants?.length || 0), 0);
  const totalViews = jobs.reduce((s, j) => s + (j.views || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      {/* Header */}
      <div className="bg-ink-900 text-white py-10">
        <div className="page-container flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-400/20 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-xl">
              {getInitials(user?.name || "")}
            </div>
            <div>
              <p className="text-ink-400 text-sm">Employer Dashboard</p>
              <h1 className="font-display text-3xl font-bold">
                Welcome, {user?.name?.split(" ")[0]} 🏢
              </h1>
              <p className="text-ink-300 text-sm mt-0.5">
                {activeJobs} active listing{activeJobs !== 1 ? "s" : ""} · {totalApplicants} total applicants
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to="/employer/company-settings" className="btn-outline border-white/20 text-white hover:bg-white/10 text-sm py-2 px-4">
              ⚙️ Company
            </Link>
            <Link to="/employer/post-job" className="btn-gold text-sm">
              + Post Job
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📋", label: "Total Jobs", val: jobs.length },
            { icon: "✅", label: "Active", val: activeJobs },
            { icon: "👥", label: "Applicants", val: totalApplicants },
            { icon: "👁️", label: "Total Views", val: totalViews },
          ].map(({ icon, label, val }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-2xl font-bold text-ink-900">{val}</p>
              <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Jobs list header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-ink-900 text-lg">Your Job Listings</h2>
          <Link to="/employer/post-job" className="btn-gold text-sm py-2 px-4">
            + Post New Job
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-3">📋</p>
            <h3 className="font-semibold text-ink-900 mb-2">No jobs posted yet</h3>
            <p className="text-sm text-ink-400 mb-5">
              Post your first job to start receiving applications.
            </p>
            <Link to="/employer/post-job" className="btn-gold">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <div
                key={job._id}
                className="card p-5 animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center text-lg flex-shrink-0">
                      {FIELD_ICONS[job.field] || "💼"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="font-semibold text-ink-900 hover:text-gold-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <span
                          className={`badge border text-xs ${
                            job.isActive
                              ? "bg-jade-50 text-jade-700 border-jade-200"
                              : "bg-ink-100 text-ink-500 border-ink-200"
                          }`}
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-400">
                        <span>{job.field}</span>
                        <span>·</span>
                        <span>{job.jobType}</span>
                        <span>·</span>
                        <span>📍 {job.location}</span>
                        <span>·</span>
                        <span>👥 {job.applicants?.length || 0} applicants</span>
                        <span>·</span>
                        <span>👁️ {job.views || 0} views</span>
                        <span>·</span>
                        <span>Posted {timeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(job)}
                      className="btn-ghost text-xs py-1.5 px-3 border border-ink-200"
                      title={job.isActive ? "Deactivate" : "Activate"}
                    >
                      {job.isActive ? "⏸ Pause" : "▶ Activate"}
                    </button>
                    <Link
                      to={`/employer/jobs/${job._id}/edit`}
                      className="btn-outline text-xs py-1.5 px-3"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deletingId === job._id}
                      className="btn-danger text-xs py-1.5 px-3 disabled:opacity-50"
                    >
                      {deletingId === job._id ? "..." : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
