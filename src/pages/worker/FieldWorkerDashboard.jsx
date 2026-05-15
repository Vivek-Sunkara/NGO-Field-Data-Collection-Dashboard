import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSmile, FiFileText, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiBell, FiSave } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';

const FieldWorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
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
        let activeDrafts = 0;

        let totalPendingForms = 0;

        const enrichedEvents = eventsData.map(event => {
          let eventTotalForms = 0;
          let eventActivitiesLogged = 0;

          if (event.forms) {
            event.forms.forEach(formItem => {
              const fId = (formItem.formId?._id || formItem.formId).toString();
              totalAssignedForms++;
              eventTotalForms++;

              // Find all submissions for this form by this worker
              const formSubmissions = submissionsData.filter(sub => 
                (sub.formId?._id || sub.formId).toString() === fId
              );

              if (formSubmissions.length === 0) {
                totalPendingForms++;
              }

              eventActivitiesLogged += formSubmissions.length;
              totalActivitiesLogged += formSubmissions.length;
            });
          }

          return {
            ...event,
            totalForms: eventTotalForms,
            activitiesLogged: eventActivitiesLogged,
            isFullyCompleted: false // In activity model, an event is never truly "finished" until deadline
          };
        });

        setEvents(enrichedEvents);
        setStats({
          totalForms: totalAssignedForms,
          completed: totalActivitiesLogged,
          pending: totalPendingForms,
          completionRate: totalAssignedForms > 0 ? Math.round(((totalAssignedForms - totalPendingForms) / totalAssignedForms) * 100) : 0,
        });
      }

      // Fetch notifications
      const notifResponse = await api.get('/admin/notifications');
      if (notifResponse.data.success) {
        setNotifications(notifResponse.data.data || []);
      }
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
            Welcome, {user?.name}! <FiSmile className="inline h-10 w-10 text-white" />
          </h1>
          <p className="text-green-100">
            You're logged in as a <strong>Field Worker</strong>
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Assigned Forms */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Assigned Forms</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalForms}</h3>
              </div>
              <FiFileText className="h-10 w-10 text-slate-600" />
            </div>
          </div>

          {/* Activities Logged */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Activities Logged</p>
                <h3 className="text-4xl font-black text-green-600 mt-2">{stats.completed}</h3>
              </div>
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-3">Total field reports submitted</p>
          </div>

          {/* Pending Submissions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Pending Submissions</p>
                <h3 className="text-4xl font-black text-yellow-600 mt-2">{stats.pending}</h3>
              </div>
              <FiClock className="h-10 w-10 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 mt-3">Forms still awaiting your first response</p>
          </div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiBell className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-900">Recent Notifications ({notifications.length})</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Assigned Events ({events.length})</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No events assigned yet. Check back later!
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
                      {event.activitiesLogged} activities logged • {event.totalForms} assigned forms
                    </p>
                  </div>
                  <button
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/worker/event/${event._id}`);
                    }}
                  >
                    View <FiArrowRight />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/worker/events')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <FiFileText className="h-5 w-5" />
              View My Events & Forms
            </button>
            <button 
              onClick={() => navigate('/worker/submissions')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="h-5 w-5" />
              View My Submissions
            </button>
            <button 
              onClick={() => navigate('/worker/drafts')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <FiSave className="h-5 w-5" />
              View My Drafts
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FieldWorkerDashboard;
