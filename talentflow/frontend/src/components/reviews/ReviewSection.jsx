import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { timeAgo, getInitials } from "../../utils/constants";

function StarRating({ value, onChange, readonly = false, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${sz} transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <svg viewBox="0 0 24 24" fill={(hovered || value) >= star ? "#f59e0b" : "none"} stroke={((hovered || value) >= star) ? "#f59e0b" : "#d1d5db"} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ companyId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: "", comment: "", pros: "", cons: "", isAnonymous: false });

  useEffect(() => {
    if (!companyId) return;
    api.get(`/reviews/company/${companyId}`)
      .then(({ data }) => { setReviews(data.reviews); setStats(data.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) return toast.error("Please select a star rating.");
    if (!form.title.trim()) return toast.error("Review title is required.");
    if (!form.comment.trim()) return toast.error("Comment is required.");
    setSubmitting(true);
    try {
      const { data } = await api.post(`/reviews/company/${companyId}`, form);
      setReviews([data.review, ...reviews]);
      setStats((prev) => ({
        totalReviews: prev.totalReviews + 1,
        averageRating: ((prev.averageRating * prev.totalReviews) + form.rating) / (prev.totalReviews + 1),
      }));
      setForm({ rating: 0, title: "", comment: "", pros: "", cons: "", isAnonymous: false });
      setShowForm(false);
      toast.success("Review posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingBars = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter((rv) => rv.rating === r).length / reviews.length) * 100) : 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title text-2xl">Employee Reviews</h2>
        {user?.role === "candidate" && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            + Write Review
          </button>
        )}
      </div>

      {/* Stats Bar */}
      {stats.totalReviews > 0 && (
        <div className="card p-6 mb-6 flex flex-col sm:flex-row gap-6">
          <div className="text-center sm:border-r border-ink-100 pr-6">
            <p className="text-5xl font-display font-bold text-ink-900">{stats.averageRating.toFixed(1)}</p>
            <StarRating value={Math.round(stats.averageRating)} readonly size="sm" />
            <p className="text-xs text-ink-400 mt-1">{stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingBars.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-ink-500 w-4">{star}★</span>
                <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-ink-400 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-gold-200 border-2 animate-fade-up">
          <h3 className="font-semibold text-ink-900 mb-4">Share Your Experience</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Overall Rating *</label>
              <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>
            <div>
              <label className="label">Review Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summarize your experience" className="input" />
            </div>
            <div>
              <label className="label">Your Review *</label>
              <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Share details of your experience at this company..." rows={4} className="input resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Pros</label>
                <input value={form.pros} onChange={(e) => setForm({ ...form, pros: e.target.value })} placeholder="What did you like?" className="input" />
              </div>
              <div>
                <label className="label">Cons</label>
                <input value={form.cons} onChange={(e) => setForm({ ...form, cons: e.target.value })} placeholder="What could be improved?" className="input" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} className="rounded" />
              <span className="text-sm text-ink-600">Post anonymously</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Posting..." : "Post Review"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-3xl mb-2">💬</p>
          <p className="font-medium text-ink-700">No reviews yet</p>
          <p className="text-sm text-ink-400 mt-1">Be the first to review this company</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center text-sm font-bold text-ink-600 flex-shrink-0">
                    {review.isAnonymous ? "?" : getInitials(review.reviewer?.name || "?")}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900 text-sm">
                      {review.isAnonymous ? "Anonymous" : review.reviewer?.name}
                    </p>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                </div>
                <span className="text-xs text-ink-400">{timeAgo(review.createdAt)}</span>
              </div>
              <h4 className="font-semibold text-ink-900 mt-3 mb-1">{review.title}</h4>
              <p className="text-sm text-ink-600 leading-relaxed">{review.comment}</p>
              {(review.pros || review.cons) && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-ink-50">
                  {review.pros && (
                    <div>
                      <p className="text-xs font-medium text-jade-600 mb-1">👍 Pros</p>
                      <p className="text-xs text-ink-600">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div>
                      <p className="text-xs font-medium text-coral-500 mb-1">👎 Cons</p>
                      <p className="text-xs text-ink-600">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
