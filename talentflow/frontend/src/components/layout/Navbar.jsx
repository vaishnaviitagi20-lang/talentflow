import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/constants";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-ink-900 rounded-xl flex items-center justify-center shadow-md group-hover:bg-ink-800 transition-colors">
              <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-ink-900">
              Talent<span className="text-gold-500">Flow+</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/jobs" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive("/jobs") ? "bg-ink-100 text-ink-900" : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"}`}>
              Browse Jobs
            </Link>
            {!user && (
              <Link to="/register?role=employer" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${location.pathname.includes("register") ? "bg-ink-100 text-ink-900" : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"}`}>
                Post a Job
              </Link>
            )}
            {user?.role === "employer" && (
              <>
                <Link to="/employer/dashboard" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive("/employer/dashboard") ? "bg-ink-100 text-ink-900" : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"}`}>
                  Dashboard
                </Link>
                <Link to="/employer/post-job" className="btn-gold text-sm px-4 py-2 ml-1">
                  + Post Job
                </Link>
              </>
            )}
            {user?.role === "candidate" && (
              <Link to="/candidate/dashboard" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive("/candidate/dashboard") ? "bg-ink-100 text-ink-900" : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"}`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </div>
            ) : (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-ink-50 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-ink-900 leading-none">{user.name}</p>
                    <p className="text-xs text-ink-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center text-gold-400 font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <svg className={`w-4 h-4 text-ink-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-ink-100 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-ink-50 mb-1">
                      <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                      <p className="text-xs text-ink-400">{user.email}</p>
                    </div>
                    {user.role === "employer" && (
                      <>
                        <Link to="/employer/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                          <span>📊</span> Dashboard
                        </Link>
                        <Link to="/employer/post-job" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                          <span>➕</span> Post Job
                        </Link>
                        <Link to="/employer/company-settings" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                          <span>🏢</span> Company Settings
                        </Link>
                      </>
                    )}
                    {user.role === "candidate" && (
                      <Link to="/candidate/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                        <span>👤</span> My Dashboard
                      </Link>
                    )}
                    <div className="border-t border-ink-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-coral-500 hover:bg-coral-50 transition-colors">
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-ink-50 text-ink-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-ink-100 py-3 space-y-1 animate-fade-in">
            <Link to="/jobs" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl">Browse Jobs</Link>
            {!user && <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50 rounded-xl">Get Started</Link>
            </>}
            {user && <>
              {user.role === "employer" && <>
                <Link to="/employer/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl">Dashboard</Link>
                <Link to="/employer/post-job" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl">Post Job</Link>
              </>}
              {user.role === "candidate" && <Link to="/candidate/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl">Dashboard</Link>}
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-coral-500 hover:bg-coral-50 rounded-xl">Sign Out</button>
            </>}
          </div>
        )}
      </div>
    </nav>
  );
}
