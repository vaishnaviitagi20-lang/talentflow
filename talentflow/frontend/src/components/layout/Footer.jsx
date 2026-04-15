import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-ink-800 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold text-white">TalentFlow+</span>
            </div>
            <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
              Connecting top talent with world-class companies. Find your next opportunity or hire exceptional candidates.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">For Candidates</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-gold-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register?role=candidate" className="hover:text-gold-400 transition-colors">Create Account</Link></li>
              <li><Link to="/candidate/dashboard" className="hover:text-gold-400 transition-colors">My Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=employer" className="hover:text-gold-400 transition-colors">Post a Job</Link></li>
              <li><Link to="/employer/dashboard" className="hover:text-gold-400 transition-colors">Employer Dashboard</Link></li>
              <li><Link to="/employer/company-settings" className="hover:text-gold-400 transition-colors">Company Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} TalentFlow+. All rights reserved.</p>
          <p className="text-xs text-ink-600">Built with MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
