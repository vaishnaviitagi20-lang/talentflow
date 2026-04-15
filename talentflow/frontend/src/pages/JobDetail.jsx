import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ContactForm from "../components/company/ContactForm";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { formatSalary, timeAgo, FIELD_ICONS, FIELD_COLORS, getInitials } from "../utils/constants";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(({ data }) => {
        setJob(data.job);
        if (user?.role === "candidate") {
          api.get("/auth/me").then(({ data: me }) => {
            setApplied(me.user.appliedJobs?.some((a) => (a.job?._id || a.job) === data.job._id));
            setSaved(me.user.savedJobs?.some((j) => (j._id || j) === data.job._id));
          }).catch(() => {});
        }
      })
      .catch(() => toast.error("Job not found."))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { navigate("/login"); return; }
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, { coverLetter });
      setApplied(true);
      setShowApplyModal(false);
      toast.success("Application submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Application failed.");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const { data } = await api.post(`/jobs/${id}/save`);
      setSaved(data.saved);
      toast.success(data.message);
    } catch (err) {
      toast.error("Failed to save job.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <p className="text-5xl mb-4">😕</p>
          <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">Job not found</h2>
          <Link to="/jobs" className="btn-primary mt-4">Browse Jobs</Link>
        </div>
      </div>
    </div>
  );

  const fieldClass = FIELD_COLORS[job.field] || FIELD_COLORS["Other"];
  const fieldIcon = FIELD_ICONS[job.field] || "🔷";

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job Header Card */}
            <div className="card p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-ink-100 border border-ink-200 flex items-center justify-center text-xl font-bold text-ink-600 flex-shrink-0">
                  {job.company?.logo ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-2xl" /> : getInitials(job.company?.name || "?")}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-ink-900 leading-snug">{job.title}</h1>
                      <Link to={`/companies/${job.company?._id}`} className="text-ink-500 hover:text-gold-600 transition-colors text-sm font-medium">
                        {job.company?.name}
                        {job.company?.isVerified && <span className="ml-1 text-gold-500">✓</span>}
                      </Link>
                    </div>
                    <button onClick={handleSave}
                      className={`p-2 rounded-xl border transition-all ${saved ? "bg-gold-50 border-gold-300 text-gold-500" : "bg-ink-50 border-ink-200 text-ink-400 hover:border-ink-400"}`}>
                      <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`badge border ${fieldClass}`}>{fieldIcon} {job.field}</span>
                <span className="badge-type">{job.jobType}</span>
                {job.isRemote && <span className="badge-remote">🌐 Remote</span>}
                <span className="badge bg-ink-50 border border-ink-200 text-ink-700">📍 {job.location}</span>
                <span className="badge bg-jade-50 border border-jade-200 text-jade-700">⚡ {job.experienceLevel}</span>
              </div>

              {/* Salary + meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-ink-50 rounded-2xl p-4">
                <div>
                  <p className="text-xs text-ink-400 mb-0.5">Salary</p>
                  <p className="font-semibold text-ink-900 text-sm">{formatSalary(job.salary)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400 mb-0.5">Posted</p>
                  <p className="font-semibold text-ink-900 text-sm">{timeAgo(job.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400 mb-0.5">Applicants</p>
                  <p className="font-semibold text-ink-900 text-sm">{job.applicants?.length || 0}</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 mt-5">
                {user?.role === "candidate" && (
                  <button onClick={() => applied ? null : setShowApplyModal(true)} disabled={applied}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${applied ? "bg-jade-50 text-jade-600 border-2 border-jade-200 cursor-default" : "btn-gold"}`}>
                    {applied ? "✓ Application Submitted" : "Apply Now"}
                  </button>
                )}
                {!user && (
                  <Link to="/login" className="flex-1 btn-primary py-3 text-center text-sm">Sign In to Apply</Link>
                )}
                <button onClick={() => setShowContactModal(true)} className="btn-outline py-3 px-4 text-sm">
                  📧 Contact
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-ink-900 text-lg mb-4">Job Description</h2>
              <div className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{job.description}</div>
              {job.requirements && (
                <div className="mt-5 pt-5 border-t border-ink-100">
                  <h3 className="font-semibold text-ink-900 mb-3">Requirements</h3>
                  <div className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
                </div>
              )}
              {job.responsibilities && (
                <div className="mt-5 pt-5 border-t border-ink-100">
                  <h3 className="font-semibold text-ink-900 mb-3">Responsibilities</h3>
                  <div className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{job.responsibilities}</div>
                </div>
              )}
              {job.skills?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-ink-100">
                  <h3 className="font-semibold text-ink-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span key={s} className="bg-ink-100 text-ink-700 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Company Card */}
            {job.company && (
              <div className="card p-5">
                <h3 className="font-semibold text-ink-900 mb-4">About the Company</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center font-bold text-ink-600">
                    {getInitials(job.company.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{job.company.name}</p>
                    {job.company.industry && <p className="text-xs text-ink-400">{job.company.industry}</p>}
                  </div>
                </div>
                {job.company.about && <p className="text-sm text-ink-600 leading-relaxed line-clamp-4 mb-4">{job.company.about}</p>}
                <div className="space-y-2 text-sm mb-4">
                  {job.company.location && <p className="flex gap-2 text-ink-600"><span>📍</span>{job.company.location}</p>}
                  {job.company.website && <a href={job.company.website} target="_blank" rel="noreferrer" className="flex gap-2 text-gold-600 hover:text-gold-500 transition-colors"><span>🌐</span>Company Website</a>}
                  {job.company.contactEmail && <p className="flex gap-2 text-ink-600"><span>📧</span>{job.company.contactEmail}</p>}
                  {job.company.averageRating > 0 && (
                    <p className="flex gap-2 text-ink-600"><span>⭐</span>{job.company.averageRating.toFixed(1)} ({job.company.totalReviews} reviews)</p>
                  )}
                </div>
                <Link to={`/companies/${job.company._id}`} className="w-full btn-outline text-sm py-2.5 block text-center">
                  View Company Profile
                </Link>
              </div>
            )}

            {/* Share */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-3 text-sm">Share this job</h3>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="w-full btn-outline text-sm py-2.5">
                🔗 Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowApplyModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-1">Apply for {job.title}</h2>
            <p className="text-ink-400 text-sm mb-5">at {job.company?.name}</p>
            <div className="mb-5">
              <label className="label">Cover Letter (optional)</label>
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={5} className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleApply} disabled={applying} className="flex-1 btn-gold py-3">
                {applying ? "Submitting..." : "Submit Application"}
              </button>
              <button onClick={() => setShowApplyModal(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Contact Employer</h2>
            <ContactForm companyId={job.company?._id} companyName={job.company?.name} onClose={() => setShowContactModal(false)} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
