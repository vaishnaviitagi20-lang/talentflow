import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import JobCard from "../components/jobs/JobCard";
import api from "../utils/api";
import { JOB_FIELDS, FIELD_ICONS, FIELD_COLORS } from "../utils/constants";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs?limit=6").then(({ data }) => {
      setRecentJobs(data.jobs);
      setStats((prev) => ({ ...prev, jobs: data.total }));
    }).finally(() => setLoading(false));
    api.get("/companies").then(({ data }) => {
      setStats((prev) => ({ ...prev, companies: data.companies?.length || 0 }));
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="page-container py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-up">
              <span className="w-2 h-2 bg-jade-400 rounded-full animate-pulse" />
              {stats.jobs > 0 ? `${stats.jobs.toLocaleString()} live job listings` : "Thousands of live listings"}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Find Work That{" "}
              <span className="text-gold-400">Matters</span>
            </h1>
            <p className="text-lg text-blue-100 mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Connecting ambitious professionals with companies building the future.
              Filter by field, location, salary, and more.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, skill, or company..."
                  className="w-full bg-white text-ink-900 pl-11 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 shadow-lg"
                />
              </div>
              <button type="submit" className="btn-gold px-6 py-4 rounded-2xl text-base shadow-lg">
                Search
              </button>
            </form>

            {/* Quick filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {["IT", "Finance", "Healthcare", "Marketing", "Core Engineering"].map((f) => (
                <Link key={f} to={`/jobs?field=${encodeURIComponent(f)}`}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-sm transition-colors backdrop-blur-sm">
                  {FIELD_ICONS[f]} {f}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="page-container py-5">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              {[
                { label: "Live Jobs", val: stats.jobs || "1,000+" },
                { label: "Companies", val: stats.companies || "500+" },
                { label: "Job Fields", val: "12+" },
                { label: "Candidates Hired", val: "10,000+" },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-gold-400">{val}</p>
                  <p className="text-xs text-blue-200">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Field */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">Browse by Field</h2>
            <p className="text-ink-400">Explore opportunities across 12 professional fields</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {JOB_FIELDS.slice(0, 12).map((f) => (
              <Link key={f} to={`/jobs?field=${encodeURIComponent(f)}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center hover:shadow-md transition-all group ${FIELD_COLORS[f] || "bg-ink-50 border-ink-200"}`}>
                <span className="text-2xl group-hover:scale-110 transition-transform">{FIELD_ICONS[f]}</span>
                <span className="text-xs font-semibold leading-snug">{f}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16 bg-ink-50">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title mb-1">Latest Opportunities</h2>
              <p className="text-ink-400 text-sm">Freshly posted — updated daily</p>
            </div>
            <Link to="/jobs" className="btn-outline text-sm hidden sm:flex">
              View All Jobs →
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-4">
              {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid gap-4">
              {recentJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/jobs" className="btn-primary">Browse All Jobs</Link>
          </div>
        </div>
      </section>

      {/* CTA for employers */}
      <section className="py-16 bg-ink-950 text-white">
        <div className="page-container text-center">
          <h2 className="font-display text-4xl font-bold mb-4">
            Hiring? Find Your <span className="text-gold-400">Next Star</span>
          </h2>
          <p className="text-ink-300 max-w-xl mx-auto mb-8">
            Post jobs and reach thousands of qualified candidates across all fields.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register?role=employer" className="btn-gold">Post a Job Free</Link>
            <Link to="/jobs" className="btn-outline border-white/20 text-white hover:bg-white/10">Browse Talent</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
