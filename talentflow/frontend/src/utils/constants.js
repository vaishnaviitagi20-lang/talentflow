export const JOB_FIELDS = [
  "IT", "Core Engineering", "Finance", "Marketing",
  "Healthcare", "Education", "Sales", "Design",
  "HR", "Legal", "Operations", "Other",
];

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

export const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead", "Executive"];

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export const FIELD_ICONS = {
  IT: "💻", "Core Engineering": "⚙️", Finance: "💹", Marketing: "📣",
  Healthcare: "🏥", Education: "🎓", Sales: "🤝", Design: "🎨",
  HR: "👥", Legal: "⚖️", Operations: "📦", Other: "🔷",
};

export const FIELD_COLORS = {
  IT: "bg-blue-50 text-blue-700 border-blue-200",
  "Core Engineering": "bg-orange-50 text-orange-700 border-orange-200",
  Finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Marketing: "bg-pink-50 text-pink-700 border-pink-200",
  Healthcare: "bg-red-50 text-red-700 border-red-200",
  Education: "bg-purple-50 text-purple-700 border-purple-200",
  Sales: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Design: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  HR: "bg-teal-50 text-teal-700 border-teal-200",
  Legal: "bg-slate-50 text-slate-700 border-slate-200",
  Operations: "bg-amber-50 text-amber-700 border-amber-200",
  Other: "bg-ink-50 text-ink-700 border-ink-200",
};

export const formatSalary = (salary) => {
  if (!salary) return "Competitive";
  if (salary.display) return salary.display;
  if (salary.min && salary.max)
    return `$${(salary.min / 1000).toFixed(0)}k – $${(salary.max / 1000).toFixed(0)}k/yr`;
  if (salary.min) return `From $${(salary.min / 1000).toFixed(0)}k/yr`;
  return "Competitive";
};

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
};

export const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
