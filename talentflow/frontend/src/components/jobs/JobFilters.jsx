import React from "react";
import { JOB_FIELDS, JOB_TYPES, EXPERIENCE_LEVELS, FIELD_ICONS } from "../../utils/constants";

export default function JobFilters({ filters, onChange, onReset, total }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => k !== "search" && v && v !== "all" && v !== ""
  );

  return (
    <div className="card p-5 sticky top-20">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-ink-900 text-sm">Filters</h3>
        <div className="flex items-center gap-2">
          {total !== undefined && (
            <span className="text-xs text-ink-400 font-mono">{total} jobs</span>
          )}
          {hasActiveFilters && (
            <button onClick={onReset} className="text-xs text-coral-500 hover:text-coral-400 font-medium">
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Field / Category */}
        <div>
          <label className="label">Field / Category</label>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            <button
              onClick={() => set("field", "all")}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${filters.field === "all" || !filters.field ? "bg-ink-900 text-white" : "hover:bg-ink-50 text-ink-700"}`}
            >
              🔷 All Fields
            </button>
            {JOB_FIELDS.map((f) => (
              <button
                key={f}
                onClick={() => set("field", f)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${filters.field === f ? "bg-ink-900 text-white" : "hover:bg-ink-50 text-ink-700"}`}
              >
                {FIELD_ICONS[f]} {f}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <label className="label">Job Type</label>
          <select
            value={filters.jobType || "all"}
            onChange={(e) => set("jobType", e.target.value)}
            className="select"
          >
            <option value="all">All Types</option>
            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Remote Toggle */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("isRemote", filters.isRemote === "true" ? "" : "true")}
              className={`relative w-10 h-5 rounded-full transition-colors ${filters.isRemote === "true" ? "bg-jade-500" : "bg-ink-200"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.isRemote === "true" ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-medium text-ink-700">Remote Only</span>
          </label>
        </div>

        {/* Location */}
        <div>
          <label className="label">Location</label>
          <input
            type="text"
            value={filters.location || ""}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City or country..."
            className="input text-sm"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="label">Experience Level</label>
          <select
            value={filters.experienceLevel || "all"}
            onChange={(e) => set("experienceLevel", e.target.value)}
            className="select"
          >
            <option value="all">All Levels</option>
            {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Salary Range */}
        <div>
          <label className="label">Min. Salary (annual)</label>
          <select
            value={filters.salaryMin || ""}
            onChange={(e) => set("salaryMin", e.target.value)}
            className="select"
          >
            <option value="">Any Salary</option>
            <option value="30000">$30k+</option>
            <option value="50000">$50k+</option>
            <option value="70000">$70k+</option>
            <option value="100000">$100k+</option>
            <option value="150000">$150k+</option>
          </select>
        </div>
      </div>
    </div>
  );
}
