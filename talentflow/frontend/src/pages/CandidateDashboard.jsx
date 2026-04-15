import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import JobCard from "../components/jobs/JobCard";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { timeAgo, getInitials } from "../utils/constants";

const STATUS_STYLES = {
  pending: "bg-gold-50 text-gold-700 border-gold-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-jade-50 text-jade-700 border-jade-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("applied");

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setMe(data.user))
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      setMe((prev) => ({
        ...prev,
        savedJobs: prev.savedJobs.filter(
          (j) => (j._id || j) !== jobId
        ),
      }));
      toast.success("Removed from saved jobs.");
    } catch {
      toast.error("Failed to unsave.");
    }
  };

  const appliedJobs = me?.appliedJobs || [];
  const savedJobs = me?.savedJobs || [];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      {/* Header */}
      <div className="bg-ink-900 text-white py-10">
        <div className="page-container">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-400/20 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-xl">
              {getInitials(user?.name || "")}
            </div>
            <div>
              <p className="text-ink-400 text-sm">Candidate Dashboard</p>
              <h1 className="font-display text-3xl font-bold">
                Welcome back, {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-ink-300 text-sm mt-0.5">
                {appliedJobs.length} application{appliedJobs.length !== 1 ? "s" : ""} · {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📨", label: "Applications", val: appliedJobs.length },
            { icon: "🔖", label: "Saved Jobs", val: savedJobs.length },
            { icon: "✅", label: "Accepted", val: appliedJobs.filter((a) => a.status === "accepted").length },
            { icon: "👁️", label: "Reviewed", val: appliedJobs.filter((a) => a.status === "reviewed").length },
          ].map(({ icon, label, val }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-2xl font-bold text-ink-900">{val}</p>
              <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-ink-200">
          {[
            { key: "applied", label: `My Applications (${appliedJobs.length})` },
            { key: "saved", label: `Saved Jobs (${savedJobs.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === key
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-ink-400 hover:text-ink-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : tab === "applied" ? (
          appliedJobs.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-5xl mb-3">📨</p>
              <h3 className="font-semibold text-ink-900 mb-2">No applications yet</h3>
              <p className="text-sm text-ink-400 mb-5">
                Start applying to jobs that match your skills.
              </p>
              <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appliedJobs.map((app, i) => {
                if (!app.job) return null;
                const job = app.job;
                return (
                  <div
                    key={job._id || i}
                    className="card p-5 flex items-center gap-4 animate-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-ink-100 flex items-center justify-center font-bold text-ink-600 flex-shrink-0 text-sm">
                      {getInitials(job.company?.name || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-semibold text-ink-900 hover:text-gold-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {job.company?.name} · Applied {timeAgo(app.appliedAt)}
                      </p>
                    </div>
                    <span
                      className={`badge border capitalize flex-shrink-0 ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}
                    >
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          savedJobs.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-5xl mb-3">🔖</p>
              <h3 className="font-semibold text-ink-900 mb-2">No saved jobs yet</h3>
              <p className="text-sm text-ink-400 mb-5">
                Save interesting jobs to revisit them later.
              </p>
              <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((job) => {
                if (!job || !job._id) return null;
                return (
                  <JobCard
                    key={job._id}
                    job={job}
                    saved={true}
                    onSave={handleUnsave}
                  />
                );
              })}
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}
