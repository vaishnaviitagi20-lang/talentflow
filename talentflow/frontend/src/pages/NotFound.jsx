import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-display text-[120px] font-bold text-ink-100 leading-none select-none">
            404
          </p>
          <div className="-mt-4">
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">
              Page not found
            </h1>
            <p className="text-ink-400 mb-8 leading-relaxed">
              The page you're looking for doesn't exist, was moved, or you
              may have mistyped the URL.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="btn-outline"
              >
                ← Go Back
              </button>
              <Link to="/" className="btn-primary">
                Go to Home
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-ink-200">
              <p className="text-sm text-ink-400 mb-3">Looking for something?</p>
              <div className="flex gap-2 justify-center">
                <Link to="/jobs" className="text-sm text-gold-600 hover:text-gold-500 font-medium transition-colors">
                  Browse Jobs →
                </Link>
                <span className="text-ink-200">·</span>
                <Link to="/register" className="text-sm text-gold-600 hover:text-gold-500 font-medium transition-colors">
                  Sign Up →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
