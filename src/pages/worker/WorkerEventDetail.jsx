import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiInfo } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import api from '@/api/client';
import Loading from '@/components/Loading';
const WorkerEventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      // We'll fetch all events and filter for now, or use a specific endpoint if exists
      // Actually, let's see if there is a specific endpoint. 
      // Most systems have GET /events/:id. Let's check.
      const response = await api.get(`/forms/events`);
      if (response.data.success) {
        const foundEvent = response.data.data.find(e => e._id === eventId);
        if (foundEvent) {
          // Enrich forms with status
          const enrichedForms = await Promise.all(
            foundEvent.forms.map(async (formItem) => {
              const fId = formItem.formId?._id || formItem.formId;
              try {
                const statusRes = await api.get(`/forms/status/${fId}`);
                return { ...formItem, statusInfo: statusRes.data.data };
              } catch (e) {
                return formItem;
              }
            })
          );
          setEvent({ ...foundEvent, forms: enrichedForms });
        } else {
          setError('Event not found');
        }
      }
    } catch (err) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };
  const getFormStatus = (form, statusInfo) => {
    if (statusInfo?.isExpired || (form?.expiryDate && new Date() > new Date(form.expiryDate))) {
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
  if (loading) return <Loading />;
  if (error || !event) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">{error || 'Event not found'}</h2>
          <button onClick={() => navigate('/worker/events')} className="mt-4 text-blue-600 hover:underline">
            Back to all events
          </button>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
        {/* Event Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg mb-8">
          <h1 className="text-4xl font-extrabold mb-3">{event.name}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">{event.description}</p>
          <div className="mt-6 flex items-center gap-4">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium">
              {event.forms?.length || 0} Total Forms
            </span>
            <span className="bg-green-400/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium text-green-100">
              {event.status || 'Active'}
            </span>
          </div>
        </div>
        {/* Forms List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Assigned Forms</h2>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FiInfo /> Click on a form to fill or view submission
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {event.forms && event.forms.map((formItem) => {
              const form = formItem.formId;
              const statusInfo = getFormStatus(form, formItem.statusInfo);
              const isExpired = statusInfo.label === 'Expired';
              return (
                <div 
                  key={form._id}
                  className={`group relative border rounded-2xl p-6 transition-all hover:shadow-md hover:border-blue-300 ${statusInfo.bgColor}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{form.title}</h3>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FiClock className="text-gray-400" />
                          <span>Expires: {new Date(form.expiryDate).toLocaleDateString()}</span>
                        </div>
                        {form.fields && (
                          <div className="flex items-center gap-1.5">
                            <FiCheckCircle className="text-gray-400" />
                            <span>{form.fields.length} Questions</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (formItem.statusInfo?.hasSubmission) {
                          const subId = formItem.statusInfo.latestSubmission?._id || formItem.statusInfo.submission?._id || formItem.statusInfo.latestSubmission || formItem.statusInfo.submission;
                          if (subId) {
                            navigate(`/worker/submissions/${subId}`);
                          }
                        } else if (!isExpired) {
                          navigate(`/worker/forms/${form._id}`);
                        }
                      }}
                      disabled={isExpired && !formItem.statusInfo?.hasSubmission}
                      className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm ${
                        formItem.statusInfo?.hasSubmission
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : isExpired
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {formItem.statusInfo?.hasSubmission ? 'View Submission' : isExpired ? 'Expired' : 'Start Form'}
                      <FiArrowRight className={`transition-transform group-hover:translate-x-1 ${isExpired && !formItem.statusInfo?.hasSubmission ? 'hidden' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default WorkerEventDetail;