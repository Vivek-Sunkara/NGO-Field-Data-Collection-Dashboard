import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import useAuth from '@/useAuth';
import api from '@/api/client';
import Toast from '@/components/Toast';

const WorkerDraftsManager = ({ onSelectDraft = null }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDrafts();
  }, [page]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/submissions/drafts/${user.id}?page=${page}&limit=10`);
      if (response.data.success) {
        setDrafts(response.data.data);
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to load drafts',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    try {
      const response = await api.delete(`/submissions/draft/${draftId}`);
      if (response.data.success) {
        setToast({
          type: 'success',
          message: 'Draft deleted successfully',
        });
        loadDrafts();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to delete draft',
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading drafts...</div>;
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiClock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No drafts yet. Start a new submission to create a draft.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-3">
        {drafts.map(draft => (
          <div key={draft._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{draft.draftTitle || 'Untitled Draft'}</h4>
                <p className="text-sm text-gray-600">
                  {draft.activityType || 'Activity type not set'} • {formatDate(draft.lastSavedAt)}
                </p>
              </div>
              <div className="ml-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {draft.completionPercentage}% complete
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${draft.completionPercentage}%` }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSelectDraft && onSelectDraft(draft._id)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                <FiEdit2 className="h-4 w-4" /> Continue Editing
              </button>
              <button
                onClick={() => handleDeleteDraft(draft._id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerDraftsManager;
