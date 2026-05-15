import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiPlus,
  FiTrash2,
  FiEdit,
} from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';
import FormStatusTracker from '@/components/admin/FormStatusTracker';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [activeStatusFormId, setActiveStatusFormId] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, currentPage, searchTerm]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsResponse = await api.get('/admin/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      // Fetch events
      const eventsResponse = await api.get(
        `/admin/events?${params.toString()}`
      );
      if (eventsResponse.data.success) {
        setEvents(eventsResponse.data.data);
        setTotalPages(
          Math.ceil(eventsResponse.data.pagination.total / itemsPerPage)
        );
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      showToast('Failed to load dashboard data', TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleEventClick = (eventId) => {
    navigate(`/admin/events/${eventId}`);
  };

  const handleViewSubmissions = (eventId) => {
    navigate(`/admin/submissions?eventId=${eventId}`);
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (window.confirm(`Are you sure you want to delete the event "${eventName}"? This will also delete all associated forms if they have no submissions.`)) {
      try {
        const response = await api.delete(`/admin/events/${eventId}`);
        if (response.data.success) {
          showToast('Event deleted successfully', TOAST_TYPES.SUCCESS);
          fetchDashboardData();
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to delete event';
        showToast(message, TOAST_TYPES.ERROR);
      }
    }
  };

  const toggleEventExpansion = (eventId) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  if (activeStatusFormId) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <FormStatusTracker 
            formId={activeStatusFormId} 
            onBack={() => setActiveStatusFormId(null)} 
          />
        </div>
      </MainLayout>
    );
  }

  if (loading && !stats) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Events Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalEvents || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiFileText className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            {/* Active Events Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Events</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeEvents || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiTrendingUp className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Submissions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalSubmissions || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiCheckCircle className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            {/* Pending Submissions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Pending Submissions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalPendingSubmissions || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiClock className="text-2xl text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => navigate('/admin/create-event')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <FiPlus /> Create Event
          </button>
          <button
            onClick={() => navigate('/admin/create-form')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <FiPlus /> Create Form
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiSearch className="text-xl" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No events found. Try adjusting your search or filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Workers
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Forms
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.map((event) => (
                    <React.Fragment key={event._id}>
                      <tr className="hover:bg-gray-50 group border-b">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleEventExpansion(event._id)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            >
                              {expandedEvents.has(event._id) ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            <span className="font-medium text-gray-900">{event.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {event.totalWorkers || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {event.formsStats?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {event.totalSubmissions || 0} / {event.totalExpected || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full ${getCompletionColor(
                                  event.completionPercentage || 0
                                )}`}
                                style={{
                                  width: `${event.completionPercentage || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {Math.round(event.completionPercentage || 0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status?.charAt(0).toUpperCase() +
                              event.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewSubmissions(event._id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View All
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id, event.name)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                      {expandedEvents.has(event._id) && (
                        <tr className="bg-gray-50/50">
                          <td colSpan="7" className="px-8 py-4">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                                  <tr>
                                    <th className="px-4 py-2">Form Title</th>
                                    <th className="px-4 py-2">Submissions</th>
                                    <th className="px-4 py-2">Progress</th>
                                    <th className="px-4 py-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {event.formsStats?.map(form => (
                                    <tr key={form.formId} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 font-medium text-gray-800">{form.title}</td>
                                      <td className="px-4 py-3">{form.submissions} / {event.totalWorkers}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                            <div 
                                              className="bg-blue-500 h-1.5 rounded-full"
                                              style={{ width: `${(form.submissions / event.totalWorkers) * 100}%` }}
                                            />
                                          </div>
                                          <span className="text-[10px]">{Math.round((form.submissions / event.totalWorkers) * 100)}%</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <button 
                                          onClick={() => setActiveStatusFormId(form.formId)}
                                          className="text-blue-600 hover:underline font-medium"
                                        >
                                          Track Status
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {(!event.formsStats || event.formsStats.length === 0) && (
                                    <tr>
                                      <td colSpan="4" className="px-4 py-4 text-center text-gray-500 italic">No forms created for this event</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft /> Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
