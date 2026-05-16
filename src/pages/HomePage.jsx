import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiLayers,
  FiMapPin,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import useAuth from '@/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'Admin' || user.role === 'NGO_Manager') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'Field Worker') {
      return <Navigate to="/worker/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="border-b border-slate-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl">
            <FiActivity className="h-8 w-8 shrink-0" aria-hidden />
            <span className="truncate">NGO Field Data</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1"
            >
              Register <FiArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="max-w-3xl">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wide mb-3">
              Field data collection
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              Collect, review, and act on ground data — in one place.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Plan events, assign dynamic forms to field workers, accept submissions with photos and
              location context, and give managers a clear view of what is happening on the ground.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-colors"
              >
                Sign in to dashboard <FiArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-gray-600 text-slate-800 dark:text-gray-100 font-semibold hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center">
              Built for NGOs and field teams
            </h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="rounded-2xl border border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-4">
                  <FiLayers className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Dynamic forms</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Admins create forms with validation, file uploads, and expiry — matched to each
                  event.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
                  <FiMapPin className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Ground truth</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Capture location, activity dates, and evidence so submissions stay tied to real
                  visits.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-4">
                  <FiUsers className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Roles that fit</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Managers oversee programs; field workers see only what they need to complete on
                  mobile.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 text-white px-8 py-12 md:px-12 md:py-16 relative overflow-hidden border border-slate-800 dark:border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
              <div className="relative max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to streamline reporting?</h2>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Use secure sign-in with OTP verification, audit-friendly activity, and exports for
                  your stakeholders.
                </p>
                <ul className="space-y-3 mb-8 text-slate-200 text-sm">
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> Event and
                    assignment workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> Submissions
                    with drafts and status
                  </li>
                  <li className="flex items-center gap-2">
                    <FiShield className="h-5 w-5 text-emerald-400 shrink-0" /> Role-based access
                  </li>
                </ul>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-100 text-slate-900 font-semibold hover:bg-slate-100 dark:hover:bg-white transition-colors"
                >
                  Go to sign in <FiArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <FiActivity className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
            NGO Field Data Collection Dashboard
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
