import React from 'react';
import { FiGlobe, FiLoader } from 'react-icons/fi';
import { WORKER_UI_LANGUAGES } from '@/constants/workerLanguages';
import { getWorkerShell } from '@/i18n/workerShell';

const FormLanguageBar = ({
  language,
  onLanguageChange,
  onTranslate,
  translating = false,
  className = '',
}) => {
  const shell = getWorkerShell(language);

  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/35 border border-indigo-100 dark:border-indigo-800 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200 text-sm font-medium">
        <FiGlobe className="h-4 w-4 flex-shrink-0" />
        <span>{shell.formPageLanguageBar}</span>
      </div>

      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={translating}
        className="px-3 py-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
      >
        {WORKER_UI_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onTranslate}
        disabled={translating}
        className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
      >
        {translating ? (
          <>
            <FiLoader className="h-4 w-4 animate-spin" />
            {shell.translating}
          </>
        ) : (
          shell.translateNow
        )}
      </button>

      <p className="text-xs text-indigo-700 dark:text-indigo-300 w-full sm:w-auto sm:ml-auto">
        {shell.answersStoredEnglishNote}
      </p>
    </div>
  );
};

export default FormLanguageBar;
