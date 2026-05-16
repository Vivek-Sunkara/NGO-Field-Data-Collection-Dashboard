import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiMail,
  FiStar,
  FiTrash2,
  FiUser,
} from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import {
  deletePerformanceReview,
  getWorkerProfile,
} from '@/api/profiles';
import StarRating from '@/components/profile/StarRating';
import PerformanceReviewForm from '@/components/profile/PerformanceReviewForm';
import LoadingSpinner from '@/components/Loading';
import { showToast, TOAST_TYPES } from '@/utils/toast';

const WorkerProfilePage = () => {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const isAdmin = user?.role === 'Admin' || user?.role === 'NGO_Manager';
  const directoryPath = isAdmin ? '/admin/workers' : '/worker/workers';

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getWorkerProfile(workerId);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch {
      showToast('Failed to load profile', TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deletePerformanceReview(reviewId);
      showToast('Review deleted', TOAST_TYPES.SUCCESS);
      loadProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', TOAST_TYPES.ERROR);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    loadProfile();
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!profile) {
    return (
      <MainLayout>
        <p className="text-gray-500">Worker not found.</p>
      </MainLayout>
    );
  }

  const { worker, activity, performance, viewer } = profile;

  return (
    <MainLayout>
      <button
        type="button"
        onClick={() => navigate(directoryPath)}
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        <FiArrowLeft /> Back to workers
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                <FiUser className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{worker.name}</h1>
              {viewer.isOwnProfile && (
                <span className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Your profile
                </span>
              )}
              <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-2 text-sm">
                <FiMail className="shrink-0" /> {worker.email}
              </p>
              <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1 text-sm">
                <FiCalendar className="shrink-0" />
                Member since {new Date(worker.memberSince).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Activity</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiCheckCircle className="text-green-500" />
                {activity.submissionsCount} submissions
              </p>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiCalendar className="text-indigo-500" />
                {activity.eventsAssignedCount} events assigned
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <FiStar className="text-amber-500 fill-amber-500" />
              Performance
            </h2>
            {performance.totalReviews > 0 ? (
              <>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {performance.averageRating}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400"> / 5</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Based on {performance.totalReviews} review
                  {performance.totalReviews !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No reviews yet</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {isAdmin && !showForm && !editingReview && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              + Add performance review
            </button>
          )}

          {isAdmin && (showForm || editingReview) && (
            <PerformanceReviewForm
              workerId={workerId}
              initialReview={editingReview}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
            />
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Performance reviews
            </h2>

            {performance.reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No performance reviews yet.
                {isAdmin && ' Be the first to rate this worker.'}
              </p>
            ) : (
              <ul className="space-y-4">
                {performance.reviews.map((review) => (
                  <li
                    key={review.id}
                    className="border border-gray-100 dark:border-gray-800 rounded-lg p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <StarRating value={review.rating} readOnly size="sm" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          by <strong>{review.ratedBy.name}</strong>
                          {review.event && (
                            <span>
                              {' '}
                              · Event: <em>{review.event.name}</em>
                            </span>
                          )}
                          {!review.event && (
                            <span className="text-gray-400"> · General review</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {review.canEdit && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReview(review);
                              setShowForm(false);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Edit review"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Delete review"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WorkerProfilePage;
