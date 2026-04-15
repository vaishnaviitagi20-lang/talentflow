import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function ContactForm({ companyId, companyName, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to contact the employer."); return; }
    setSending(true);
    try {
      const { data } = await api.post(`/companies/${companyId}/contact`, form);
      toast.success(data.message);
      setForm({ subject: "", message: "" });
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-ink-600 mb-3">Please log in to contact this employer.</p>
        <a href="/login" className="btn-primary">Sign In</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-ink-50 rounded-xl px-4 py-3">
        <p className="text-xs text-ink-500">Sending to</p>
        <p className="font-medium text-ink-900 text-sm">{companyName}</p>
      </div>
      <div>
        <label className="label">Subject *</label>
        <input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="e.g. Inquiry about the Senior Engineer role"
          className="input"
          required
        />
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Introduce yourself and ask your question..."
          rows={5}
          className="input resize-none"
          required
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={sending} className="btn-primary flex-1">
          {sending ? "Sending..." : "Send Message"}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        )}
      </div>
    </form>
  );
}
