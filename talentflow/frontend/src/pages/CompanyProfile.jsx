import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import JobCard from "../components/jobs/JobCard";
import ReviewSection from "../components/reviews/ReviewSection";
import ContactForm from "../components/company/ContactForm";
import api from "../utils/api";
import { getInitials } from "../utils/constants";

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [tab, setTab] = useState("jobs");

  useEffect(() => {
    api
      .get(`/companies/${id}`)
      .then(({ data }) => {
        setCompany(data.company);
        setJobs(data.jobs || []);
      })
      .catch(() => toast.error("Company not found."))
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-5xl mb-4">🏢</p>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">Company not found</h2>
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = ["jobs", "reviews", "about"];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      {/* Company Header */}
      <div className="bg-ink-900 text-white py-12">
        <div className="page-container">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-gold-400 flex-shrink-0 overflow-hidden">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(company.name)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold">{company.name}</h1>
                {company.isVerified && (
                  <span className="badge bg-gold-400/20 text-gold-300 border border-gold-400/30 text-xs">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-ink-300 text-sm mb-4">
                {company.industry && `${company.industry}`}
                {company.industry && company.size && " · "}
                {company.size && `${company.size} employees`}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-300">
                {company.location && <span>📍 {company.location}</span>}
                {company.founded && <span>📅 Founded {company.founded}</span>}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    🌐 Website ↗
                  </a>
                )}
                {company.contactEmail && (
                  <span>📧 {company.contactEmail}</span>
                )}
                {company.averageRating > 0 && (
                  <span>
                    ⭐ {company.averageRating.toFixed(1)} ({company.totalReviews}{" "}
                    {company.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowContact(true)}
              className="btn-gold hidden sm:flex flex-shrink-0"
            >
              📧 Contact
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/10">
            {[
              { label: "Open Positions", val: jobs.length },
              { label: "Avg. Rating", val: company.averageRating > 0 ? `${company.averageRating.toFixed(1)} ⭐` : "—" },
              { label: "Reviews", val: company.totalReviews || 0 },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xl font-bold text-gold-400">{val}</p>
                <p className="text-xs text-ink-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-ink-200">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-sm font-medium capitalize -mb-px border-b-2 transition-colors ${
                    tab === t
                      ? "border-ink-900 text-ink-900"
                      : "border-transparent text-ink-400 hover:text-ink-700"
                  }`}
                >
                  {t === "jobs" ? `Jobs (${jobs.length})` : t === "reviews" ? `Reviews (${company.totalReviews || 0})` : "About"}
                </button>
              ))}
            </div>

            {tab === "jobs" && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="card text-center py-14">
                    <p className="text-4xl mb-3">💼</p>
                    <p className="font-medium text-ink-700 mb-1">No open positions right now</p>
                    <p className="text-sm text-ink-400">Check back later for new opportunities.</p>
                  </div>
                ) : (
                  jobs.map((job) => <JobCard key={job._id} job={job} />)
                )}
              </div>
            )}

            {tab === "reviews" && <ReviewSection companyId={id} />}

            {tab === "about" && (
              <div className="card p-6">
                <h2 className="font-semibold text-ink-900 text-lg mb-4">About {company.name}</h2>
                {company.about ? (
                  <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">
                    {company.about}
                  </p>
                ) : (
                  <p className="text-ink-400 text-sm italic">No description has been provided yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Company Info Card */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-4">Company Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["🏢", "Industry", company.industry],
                  ["👥", "Company Size", company.size ? `${company.size} employees` : null],
                  ["📍", "Location", company.location],
                  ["📅", "Founded", company.founded],
                  ["📧", "Contact", company.contactEmail],
                ].map(([icon, label, val]) =>
                  val ? (
                    <div key={label} className="flex items-start gap-3">
                      <span className="mt-0.5">{icon}</span>
                      <div>
                        <p className="text-xs text-ink-400">{label}</p>
                        <p className="text-ink-900 font-medium">{val}</p>
                      </div>
                    </div>
                  ) : null
                )}
                {company.website && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">🌐</span>
                    <div>
                      <p className="text-xs text-ink-400">Website</p>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gold-600 hover:text-gold-500 font-medium transition-colors break-all"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowContact(true)}
                className="w-full btn-primary mt-5 text-sm py-2.5"
              >
                📧 Contact Company
              </button>
            </div>

            {/* Quick stats */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-3 text-sm">At a Glance</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Open Roles", val: jobs.length, icon: "💼" },
                  { label: "Reviews", val: company.totalReviews || 0, icon: "⭐" },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="bg-ink-50 rounded-xl p-3 text-center">
                    <p className="text-xl mb-0.5">{icon}</p>
                    <p className="font-bold text-ink-900 text-lg">{val}</p>
                    <p className="text-xs text-ink-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowContact(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-ink-900">
                Contact {company.name}
              </h2>
              <button
                onClick={() => setShowContact(false)}
                className="p-2 rounded-xl hover:bg-ink-50 text-ink-400"
              >
                ✕
              </button>
            </div>
            <ContactForm
              companyId={id}
              companyName={company.name}
              onClose={() => setShowContact(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
