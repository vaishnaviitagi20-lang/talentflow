import React from "react";
import { Link } from "react-router-dom";
import { formatSalary, timeAgo, FIELD_COLORS, FIELD_ICONS, getInitials } from "../../utils/constants";

export default function JobCard({ job, saved = false, onSave, applied = false, compact = false }) {
  const fieldClass = FIELD_COLORS[job.field] || FIELD_COLORS["Other"];
  const fieldIcon = FIELD_ICONS[job.field] || "🔷";

  return (
    <div className={`card-hover p-5 group ${compact ? "" : "p-6"}`}>
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-ink-100 border border-ink-200 flex items-center justify-center overflow-hidden">
          {job.company?.logo ? (
            <img src={job.company.logo} alt={job.company?.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-ink-600 text-lg">
              {getInitials(job.company?.name || "?")}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/jobs/${job._id}`}
                className="font-semibold text-ink-900 hover:text-gold-600 transition-colors text-base leading-snug line-clamp-1 group-hover:text-gold-600"
              >
                {job.title}
              </Link>
              <Link
                to={`/companies/${job.company?._id}`}
                className="text-sm text-ink-500 hover:text-ink-700 transition-colors mt-0.5 block"
              >
                {job.company?.name}
                {job.company?.isVerified && (
                  <span className="ml-1 text-gold-500" title="Verified Company">✓</span>
                )}
              </Link>
            </div>
            {onSave && (
              <button
                onClick={(e) => { e.preventDefault(); onSave(job._id); }}
                className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${saved ? "text-gold-500 bg-gold-50" : "text-ink-300 hover:text-ink-600 hover:bg-ink-50"}`}
                title={saved ? "Remove from saved" : "Save job"}
              >
                <svg className="w-4.5 h-4.5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className={`badge border ${fieldClass} text-xs`}>
              {fieldIcon} {job.field}
            </span>
            <span className="badge-type">{job.jobType}</span>
            {job.isRemote && <span className="badge-remote">🌐 Remote</span>}
            <span className="badge bg-ink-50 text-ink-600 border border-ink-100">
              📍 {job.location}
            </span>
          </div>

          {/* Salary + meta */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-ink-900">
                💰 {formatSalary(job.salary)}
              </span>
              {job.experienceLevel && (
                <span className="text-xs text-ink-400">{job.experienceLevel} level</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {applied && (
                <span className="badge bg-jade-500/10 text-jade-600 border border-jade-500/20">Applied</span>
              )}
              {job.company?.averageRating > 0 && (
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  ⭐ {job.company.averageRating.toFixed(1)}
                </span>
              )}
              <span className="text-xs text-ink-400">{timeAgo(job.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
