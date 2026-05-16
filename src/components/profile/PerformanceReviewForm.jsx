import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import {
  createPerformanceReview,
  updatePerformanceReview,
} from '@/api/profiles';

const PerformanceReviewForm = ({
  workerId,
  initialReview = null,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(initialReview);
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [eventId, setEventId] = useState(initialReview?.event?.id || '');
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/admin/events?limit=100');
        if (res.data.success) {
          setEvents(res.data.data || []);
        }
      } catch {
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      showToast('Please select a star rating', TOAST_TYPES.ERROR);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        workerId,
        rating,
        comment: comment.trim(),
        eventId: eventId || null,
      };

      if (isEditing) {
        await updatePerformanceReview(initialReview.id, payload);
        showToast('Review updated', TOAST_TYPES.SUCCESS);
      } else {
        await createPerformanceReview(payload);
        showToast('Review submitted', TOAST_TYPES.SUCCESS);
      }
      onSuccess?.();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to save review. Please try again.';
      showToast(msg, TOAST_TYPES.ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {isEditing ? 'Edit performance review' : 'Rate this worker'}
      </h3>

      <div className="space-y-4">
        <StarRating label="Rating *" value={rating} onChange={setRating} size="lg" />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event (optional)
          </label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">General (not tied to an event)</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            One rating per event per admin. Leave empty for a general review.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share feedback on reliability, quality of work, teamwork..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : isEditing ? 'Update review' : 'Submit review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PerformanceReviewForm;
