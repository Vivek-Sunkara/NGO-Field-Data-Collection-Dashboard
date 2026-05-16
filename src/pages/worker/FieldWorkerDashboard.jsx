import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSmile, FiFileText, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiBell, FiSave } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import { useWorkerLanguage } from '@/context/WorkerLanguageContext';
import { getWorkerShell } from '@/i18n/workerShell';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';

const FieldWorkerDashboard = () => {
  const { user } = useAuth();
  const { preferredLanguage } = useWorkerLanguage();
  const t = getWorkerShell(preferredLanguage);
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    drafts: 0,
  });

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned events and submissions in parallel
      const [eventsResponse, submissionsResponse] = await Promise.all([
        api.get('/forms/events'),
        api.get('/forms/submissions')
      ]);

      if (eventsResponse.data.success && submissionsResponse.data.success) {
        const eventsData = eventsResponse.data.data || [];
        const submissionsData = submissionsResponse.data.data || [];
        
        // Map of formId -> submission for quick lookup
        const submissionMap = new Map();
        submissionsData.forEach(sub => {
          if (sub.formId) {
            const fId = (sub.formId._id || sub.formId).toString();
            submissionMap.set(fId, sub);
          }
        });

        setEvents(eventsData);

        // Calculate activity stats (Activity Model)
        let totalAssignedForms = 0;
        let totalActivitiesLogged = 0;
        let totalPendingForms = 0;

        const enrichedEvents = eventsData.map(event => {
          let eventTotalForms = 0;
          let eventActivitiesLogged = 0;

          if (event.forms) {
            event.forms.forEach(formItem => {
              const fId = (formItem.formId?._id || formItem.formId).toString();
              totalAssignedForms++;
              eventTotalForms++;

              const expiryDate = formItem.formId?.expiryDate;
              const expiryTime = expiryDate ? new Date(expiryDate) : null;
              const isExpired = expiryTime ? Date.now() > expiryTime.getTime() : false;

              // Find all submissions for this form by this worker
              const formSubmissions = submissionsData.filter(sub => 
                (sub.formId?._id || sub.formId).toString() === fId
              );

              if (formSubmissions.length === 0 && !isExpired) {
                totalPendingForms++;
              }

              eventActivitiesLogged += formSubmissions.length;
              totalActivitiesLogged += formSubmissions.length;
            });
          }

          return {
            ...event,
            totalForms: eventTotalForms,
            completedForms: eventActivitiesLogged,
            activitiesLogged: eventActivitiesLogged,
            isFullyCompleted: eventTotalForms > 0 && eventActivitiesLogged >= eventTotalForms,
          };
        });

        setEvents(enrichedEvents);
        setStats((prev) => ({
          totalForms: totalAssignedForms,
          completed: totalActivitiesLogged,
          pending: totalPendingForms,
          completionRate: totalAssignedForms > 0 ? Math.round(((totalAssignedForms - totalPendingForms) / totalAssignedForms) * 100) : 0,
          drafts: prev.drafts,
        }));
      }

      // Fetch notifications
      const [notifResponse, draftsResponse] = await Promise.all([
        api.get('/admin/notifications'),
        api.get('/forms/drafts'),
      ]);

      if (notifResponse.data.success) {
        setNotifications(notifResponse.data.data || []);
      }

      const draftCount = draftsResponse.data.success ? (draftsResponse.data.data || []).length : 0;

      setStats((prev) => ({
        ...prev,
        drafts: draftCount,
      }));
    } catch (err) {
      console.error('Error fetching worker data:', err);
      showToast('Failed to load dashboard', TOAST_TYPES.ERROR);
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

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-2">
            {t.welcomeTitle(user?.name || '')} <FiSmile className="inline h-10 w-10 text-white" />
          </h1>
          <p className="text-green-100">
            {t.loggedInAs} <strong>{t.roleFieldWorker}</strong>
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Assigned Forms */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">{t.assignedForms}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalForms}</h3>
              </div>
              <FiFileText className="h-10 w-10 text-slate-600" />
            </div>
          </div>

          {/* Activities Logged */}
          <div
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer"
            onClick={() => navigate('/worker/submissions?status=submitted')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{t.activitiesLogged}</p>
                <h3 className="text-4xl font-black text-green-600 mt-2">{stats.completed}</h3>
              </div>
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-3">{t.fieldReportsSubmitted}</p>
          </div>

          {/* Pending Submissions */}
          <div
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition cursor-pointer"
            onClick={() => navigate('/worker/submissions/pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{t.pendingSubmissions}</p>
                <h3 className="text-4xl font-black text-yellow-600 mt-2">{stats.pending}</h3>
              </div>
              <FiClock className="h-10 w-10 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 mt-3">{t.pendingSubmissionsHint}</p>
          </div>

          {/* Drafts */}
          <div
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-slate-500 hover:shadow-xl transition cursor-pointer"
            onClick={() => navigate('/worker/drafts')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{t.drafts}</p>
                <h3 className="text-4xl font-black text-slate-700 mt-2">{stats.drafts}</h3>
              </div>
              <FiSave className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-xs text-gray-500 mt-3">{t.savedDraftsWaiting}</p>
          </div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiBell className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-900">{t.recentNotifications} ({notifications.length})</h2>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif._id} className="bg-white rounded p-3 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900">{notif.title}</p>
                  <p className="text-gray-700 text-sm">{notif.message}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Events */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.yourAssignedEvents} ({events.length})</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t.noEventsDash}
            </p>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div
                  key={event._id}
                  className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 p-4 rounded transition cursor-pointer"
                  onClick={() => navigate(`/worker/event/${event._id}`)}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{event.name}</p>
                    <p className="text-gray-500 text-sm">
                      {t.formsCompletedLine(event.completedForms, event.totalForms)} • {t.status}: {event.isFullyCompleted ? t.statusCompleted : t.statusActive}
                      • {event.activitiesLogged} {t.activitiesLoggedLabel} • {event.totalForms} {t.assignedFormsLabel}
                    </p>
                  </div>
                  <button
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/worker/event/${event._id}`);
                    }}
                  >
                    {t.view} <FiArrowRight />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.quickActions}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/worker/events')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <FiFileText className="h-5 w-5" />
              {t.viewEventsForms}
            </button>
            <button 
              onClick={() => navigate('/worker/submissions')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="h-5 w-5" />
              {t.viewSubmissions}
            </button>
            
            <button 
              onClick={() => navigate('/worker/analytics')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <FiTrendingUp className="h-5 w-5" />
              {t.viewMyAnalytics}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FieldWorkerDashboard;
