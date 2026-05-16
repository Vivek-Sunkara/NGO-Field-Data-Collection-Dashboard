import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/useAuth';
import { useWorkerLanguage } from '@/context/WorkerLanguageContext';
import { WORKER_UI_LANGUAGES } from '@/constants/workerLanguages';
import { getWorkerShell } from '@/i18n/workerShell';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import ThemeToggle from '@/components/ThemeToggle';
import { FiHome, FiLogOut, FiActivity, FiGlobe, FiUsers, FiUser } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();
  const { preferredLanguage, setPreferredLanguage, bumpTranslationRefresh } = useWorkerLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const shell = getWorkerShell(preferredLanguage);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const onFormRelatedPage =
    /\/worker\/forms\/[^/]+$/.test(location.pathname) ||
    /^\/worker\/submit-form(\/|$)/.test(location.pathname);

  const handleHeaderTranslate = () => {
    bumpTranslationRefresh();
    if (!onFormRelatedPage) {
      showToast(shell.translateHint, TOAST_TYPES.INFO);
    }
  };

  const isFieldWorker = user?.role === 'Field Worker';

  return (
    <header className="bg-white shadow-md dark:bg-gray-900 dark:shadow-gray-950/50 border-b border-transparent dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Left: logo + nav */}
          <div className="flex items-center justify-between gap-4 min-w-0 xl:justify-start">
            <div className="flex items-center gap-6 min-w-0">
              <h1
                className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer flex items-center gap-2 shrink-0"
                onClick={() => {
                  if (user?.role === 'Admin' || user?.role === 'NGO_Manager') {
                    navigate('/admin/dashboard');
                  } else if (isFieldWorker) {
                    navigate('/worker/dashboard');
                  } else {
                    navigate('/');
                  }
                }}
              >
                <FiActivity className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
                <span className="truncate">{isFieldWorker ? shell.appTitle : 'NGO Dashboard'}</span>
              </h1>

              {user && (
                <nav className="hidden md:flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (user.role === 'Admin' || user.role === 'NGO_Manager') {
                        navigate('/admin/dashboard');
                      } else {
                        navigate('/worker/dashboard');
                      }
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
                  >
                    <FiHome className="w-5 h-5" />
                    {isFieldWorker ? shell.navDashboard : 'Dashboard'}
                  </button>
                  {isFieldWorker && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate('/worker/workers')}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
                      >
                        <FiUsers className="w-5 h-5" />
                        Workers
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/worker/profile')}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
                      >
                        <FiUser className="w-5 h-5" />
                        My Profile
                      </button>
                    </>
                  )}
                  {(user.role === 'Admin' || user.role === 'NGO_Manager') && (
                    <button
                      type="button"
                      onClick={() => navigate('/admin/workers')}
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
                    >
                      <FiUsers className="w-5 h-5" />
                      Workers
                    </button>
                  )}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-2 xl:hidden">
              <ThemeToggle />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 font-semibold rounded-lg flex items-center gap-2"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle: language + Translate (field workers) — same row on desktop */}
          {isFieldWorker && (
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 px-3 py-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-sm font-semibold shrink-0">
                <FiGlobe className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{shell.formLanguageLabel}</span>
              </div>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="text-sm border-2 border-indigo-300 dark:border-indigo-700 rounded-lg px-2 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[11rem] grow sm:grow-0"
                aria-label={shell.formLanguageLabel}
              >
                {WORKER_UI_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleHeaderTranslate}
                title="Translate form / Refresh translation"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors border-2 border-indigo-800 shadow-md whitespace-nowrap sm:order-none order-last"
              >
                {shell.translateNow}
                <span className="hidden sm:inline text-indigo-100 font-normal text-xs">(Translate)</span>
              </button>
            </div>
          )}

          {/* Right: welcome + menu (desktop) */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              Welcome, <strong className="text-gray-900 dark:text-white">{user?.name}</strong>
            </span>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
              {user?.role}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200"
                aria-label="Menu"
              >
                <svg className="w-6 h-6 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 font-semibold rounded-lg flex items-center gap-2"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / tablet: welcome strip */}
        {user && (
          <div className="mt-2 flex xl:hidden flex-wrap items-center justify-between gap-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-2">
            <span className="text-gray-700 dark:text-gray-300">
              Welcome, <strong className="text-gray-900 dark:text-white">{user?.name}</strong>
            </span>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold">
              {user?.role}
            </span>
          </div>
        )}

        {isFieldWorker && (
          <p className="mt-2 text-xs text-indigo-900 dark:text-indigo-200 xl:mt-3 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-lg px-2 py-1.5 border border-indigo-100 dark:border-indigo-900">
            <strong className="font-semibold">Translate:</strong> {shell.translateHint}
          </p>
        )}
      </div>
    </header>
  );
};

export default Header;
