import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiArrowRight, FiClock, FiSave } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import { useWorkerLanguage } from '@/context/WorkerLanguageContext';
import { getWorkerShell } from '@/i18n/workerShell';
import api from '@/api/client';
import Loading from '@/components/Loading';
import Toast from '@/components/Toast';

const WorkerDrafts = () => {
  const { preferredLanguage } = useWorkerLanguage();
  const t = getWorkerShell(preferredLanguage);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forms/drafts');
      if (response.data.success) {
        setDrafts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
      setToast({
        type: 'error',
        message: 'Failed to load draft submissions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueDraft = (draft) => {
    navigate(`/worker/forms/${draft.formId?._id || draft.formId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.myDrafts}</h1>
            <p className="text-gray-600 mt-1">{t.draftsSubtitle}</p>
          </div>
          <button
            onClick={() => navigate('/worker/submissions')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FiFileText className="h-4 w-4" /> {t.viewSubmittedReports}
          </button>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {drafts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FiSave className="mx-auto h-16 w-16 text-blue-200 mb-4" />
            <p className="text-xl font-semibold text-gray-700">{t.noDraftsFound}</p>
            <p className="text-gray-500 mt-2">{t.draftsEmptyHint}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide">
                      <FiClock className="h-4 w-4" /> {t.draftSavedOn} {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString()}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{draft.formId?.title || t.untitledForm}</h2>
                    <p className="text-sm text-gray-600">{t.eventLabel}: {draft.eventId?.name || t.unknownEvent}</p>
                    <p className="text-sm text-gray-600">{t.progressLabel}: {draft.completionPercentage ?? 0}% {t.completed}</p>
                  </div>

                  <button
                    onClick={() => handleContinueDraft(draft)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    {t.continueDraft} <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WorkerDrafts;
