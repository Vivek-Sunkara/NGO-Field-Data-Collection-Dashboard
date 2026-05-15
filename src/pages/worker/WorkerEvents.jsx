import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/useAuth';
import api from '@/api/client';
import Toast from '@/components/Toast';

const WorkerEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forms/events');

      if (response.data.success) {
        const eventsData = response.data.data || [];

        const enrichedEvents = await Promise.all(
          eventsData.map(async (event) => {
            const enrichedForms = await Promise.all(
              event.forms.map(async (formItem) => {
                const formId = formItem.formId?._id;
                if (!formId) return formItem;

                try {
                  const statusResponse = await api.get(`/forms/status/${formId}`);
                  if (statusResponse.data.success) {
                    return {
                      ...formItem,
                      statusInfo: statusResponse.data.data,
                    };
                  }
                } catch (statusError) {
                  console.error('Failed to fetch form status:', statusError);
                }
                return formItem;
              })
            );

            return {
              ...event,
              forms: enrichedForms,
            };
          })
        );

        setEvents(enrichedEvents);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch events';
      setToast({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormStatus = (form, statusInfo) => {
    if (statusInfo?.isExpired || new Date() > new Date(form.expiryDate)) {
      return { label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    if (statusInfo?.hasSubmission) {
      return { label: 'Submitted', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
    if (statusInfo?.hasDraft) {
      return { label: 'Draft', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
    return { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Events</h1>
          <p className="text-gray-600">View and fill assigned forms for your events</p>
        </div>

        {/* Toast */}
        {toast && (
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-2">No events assigned yet</p>
            <p className="text-gray-400 text-sm">Check back later for new events</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{event.name}</h2>
                    {event.description && (
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    )}
                  </div>
                </div>

                {/* Forms List (Vertical) */}
                {event.forms && event.forms.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {event.forms.map((formItem) => {
                      const form = formItem.formId;
                      const statusInfo = getFormStatus(form, formItem.statusInfo);
                      const isExpired = statusInfo.label === 'Expired';

                      return (
                        <div
                          key={form._id}
                          className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-300 ${statusInfo.bgColor}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-800">{form.title}</h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color} bg-white border border-current opacity-80`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <FiClock className="h-3.5 w-3.5" />
                                <span>Expires: {formatDate(form.expiryDate)}</span>
                              </div>
                              {form.fields && (
                                <div className="flex items-center gap-1">
                                  <FiCheckCircle className="h-3.5 w-3.5" />
                                  <span>{form.fields.length} Questions</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <button
                              onClick={() => {
                                if (formItem.statusInfo?.hasSubmission) {
                                  const subId = formItem.statusInfo.submission?._id || formItem.statusInfo.submission;
                                  navigate(`/worker/submissions/${subId}`);
                                } else if (!isExpired) {
                                  navigate(`/worker/forms/${form._id}`);
                                }
                              }}
                              disabled={isExpired && !formItem.statusInfo?.hasSubmission}
                              className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                formItem.statusInfo?.hasSubmission
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : isExpired
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                              }`}
                            >
                              {formItem.statusInfo?.hasSubmission ? (
                                <>View Submission <FiArrowRight /></>
                              ) : isExpired ? (
                                <>Expired <FiAlertCircle /></>
                              ) : (
                                <>Fill Form <FiArrowRight /></>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No forms assigned to this event</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WorkerEvents;
