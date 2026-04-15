import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const DEFAULT_FILTERS = { search: "", field: "all", jobType: "all", isRemote: "", location: "", experienceLevel: "all", salaryMin: "" };

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    search: searchParams.get("search") || "",
    field: searchParams.get("field") || "all",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load saved/applied from user
  useEffect(() => {
    if (user?.role === "candidate") {
      api.get("/auth/me").then(({ data }) => {
        setSavedJobs((data.user.savedJobs || []).map((j) => (typeof j === "object" ? j._id : j)));
        setAppliedJobs((data.user.appliedJobs || []).map((a) => (a.job?._id || a.job)));
      }).catch(() => {});
    }
  }, [user]);

  const fetchJobs = useCallback(async (f, p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (f.search) params.set("search", f.search);
      if (f.field && f.field !== "all") params.set("field", f.field);
      if (f.jobType && f.jobType !== "all") params.set("jobType", f.jobType);
      if (f.isRemote) params.set("isRemote", f.isRemote);
      if (f.location) params.set("location", f.location);
      if (f.experienceLevel && f.experienceLevel !== "all") params.set("experienceLevel", f.experienceLevel);
      if (f.salaryMin) params.set("salaryMin", f.salaryMin);

      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce on search input, immediate on other filters
  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(filters, 1), filters.search ? 400 : 0);
    setPage(1);
    return () => clearTimeout(timer);
  }, [filters, fetchJobs]);

  const handleSave = async (jobId) => {
    if (!user) { toast.error("Please log in to save jobs."); return; }
    try {
      const { data } = await api.post(`/jobs/${jobId}/save`);
      setSavedJobs((prev) => data.saved ? [...prev, jobId] : prev.filter((id) => id !== jobId));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job.");
    }
  };

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const activeFieldLabel = filters.field !== "all" ? filters.field : null;

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      {/* Header */}
      <div className="bg-ink-900 text-white py-10">
        <div className="page-container">
          <h1 className="font-display text-3xl font-bold mb-2">
            {activeFieldLabel ? `${activeFieldLabel} Jobs` : "Browse All Jobs"}
          </h1>
          <p className="text-ink-300">
            {total > 0 ? `${total.toLocaleString()} position${total !== 1 ? "s" : ""} found` : "Find your next opportunity"}
          </p>
          {/* Search bar in header */}
          <div className="relative mt-5 max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search jobs, skills, companies..."
              className="w-full bg-white/10 border border-white/20 text-white placeholder-ink-400 pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-gold-400 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="page-container py-8 flex-1">
        {/* Mobile filters toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <p className="text-sm text-ink-500">{total} results</p>
          <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="btn-outline text-sm py-2 px-4">
            🔧 Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters — desktop always visible, mobile toggle */}
          <aside className={`w-72 flex-shrink-0 ${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
            <JobFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} total={total} />
          </aside>

          {/* Job list */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="skeleton h-36 rounded-2xl" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="card p-16 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-semibold text-ink-900 text-lg mb-2">No jobs found</h3>
                <p className="text-ink-400 mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={handleReset} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <div key={job._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                      <JobCard
                        job={job}
                        saved={savedJobs.includes(job._id)}
                        onSave={user?.role === "candidate" ? handleSave : undefined}
                        applied={appliedJobs.includes(job._id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => { setPage(p => p - 1); fetchJobs(filters, page - 1); }} disabled={page === 1} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
                    <span className="text-sm text-ink-500 px-3">Page {page} of {pages}</span>
                    <button onClick={() => { setPage(p => p + 1); fetchJobs(filters, page + 1); }} disabled={page === pages} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
