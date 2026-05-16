import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { WORKER_LANGUAGE_STORAGE_KEY } from '@/constants/workerLanguages';

const WorkerLanguageContext = createContext({
  preferredLanguage: 'en',
  setPreferredLanguage: () => {},
  translationRefreshNonce: 0,
  bumpTranslationRefresh: () => {},
});

export const WorkerLanguageProvider = ({ children }) => {
  const [preferredLanguage, setPreferredLanguageState] = useState(() => {
    try {
      return localStorage.getItem(WORKER_LANGUAGE_STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const [translationRefreshNonce, setTranslationRefreshNonce] = useState(0);

  const setPreferredLanguage = useCallback((code) => {
    setPreferredLanguageState(code);
    try {
      localStorage.setItem(WORKER_LANGUAGE_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const bumpTranslationRefresh = useCallback(() => {
    setTranslationRefreshNonce((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      preferredLanguage,
      setPreferredLanguage,
      translationRefreshNonce,
      bumpTranslationRefresh,
    }),
    [preferredLanguage, setPreferredLanguage, translationRefreshNonce, bumpTranslationRefresh]
  );

  return (
    <WorkerLanguageContext.Provider value={value}>{children}</WorkerLanguageContext.Provider>
  );
};

export const useWorkerLanguage = () => useContext(WorkerLanguageContext);
