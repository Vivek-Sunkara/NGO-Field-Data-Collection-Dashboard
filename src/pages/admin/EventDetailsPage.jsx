import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiFileText } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';
import AIAnalysisPanel from '@/components/admin/AIAnalysisPanel';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventResponse = await api.get(`/admin/events/${eventId}`);
      if (eventResponse.data.success) {
        setEvent(eventResponse.data.data);
      }

      // Fetch submission statistics
      const statsResponse = await api.get(`/admin/events/${eventId}/submissions/stats`);
      if (statsResponse.data.success) {
        setSubmissionStats(statsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details');
      showToast('Failed to load event details', TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Event not found'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Event Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.name}</h1>
          
          {event.description && (
            <p className="text-gray-600 mb-4">{event.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <FiCalendar className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <FiMapPin className="text-red-600" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <FiUsers className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-600">Submissions</p>
                <p className="font-medium text-gray-900">
                  {submissionStats?.totalSubmissions || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <FiFileText className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className="font-medium text-gray-900 capitalize">
                  {event.status || 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Statistics */}
        {submissionStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 border border-blue-200">
              <p className="text-blue-600 text-sm font-semibold">Total Submissions</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {submissionStats.totalSubmissions}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 border border-green-200">
              <p className="text-green-600 text-sm font-semibold">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {submissionStats.completedSubmissions || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-4 border border-orange-200">
              <p className="text-orange-600 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {submissionStats.pendingSubmissions || 0}
              </p>
            </div>
          </div>
        )}

        {/* AI Analysis Panel */}
        {submissionStats && submissionStats.totalSubmissions > 0 ? (
          <AIAnalysisPanel eventId={eventId} eventName={event.name} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700">
              No submissions available for this event yet. AI analysis will be available once submissions are received.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default EventDetailsPage;
