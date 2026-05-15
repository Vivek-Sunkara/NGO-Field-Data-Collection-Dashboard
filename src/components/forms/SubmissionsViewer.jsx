import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiImage, FiEye } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/api/client';
import Toast from '@/components/Toast';

const SubmissionsViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const urlEventId = searchParams.get('eventId');
  const urlFormId = searchParams.get('formId');

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    eventId: urlEventId || '',
    formId: urlFormId || '',
    workerId: searchParams.get('workerId') || '',
    startDate: '',
    endDate: '',
  });

  const [availableEvents, setAvailableEvents] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);

  useEffect(() => {
    loadEvents();
    loadWorkers();
  }, []);

  useEffect(() => {
    if (filters.eventId) {
      loadForms(filters.eventId);
    } else {
      setAvailableForms([]);
    }
  }, [filters.eventId]);

  useEffect(() => {
    loadSubmissions();
  }, [page, filters]);

  const loadEvents = async () => {
    try {
      const response = await api.get('/admin/events');
      if (response.data.success) {
        setAvailableEvents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await api.get('/admin/workers');
      if (response.data.success) {
        setAvailableWorkers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  };

  const loadForms = async (eventId) => {
    try {
      const response = await api.get(`/admin/events/${eventId}`);
      if (response.data.success) {
        setAvailableForms(response.data.data.formsDetail || []);
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });

      const response = await api.get(`/admin/submissions?${queryParams.toString()}`);
      if (response.data.success) {
        setSubmissions(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to load submissions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const downloadAsCSV = () => {
    if (submissions.length === 0) return;

    // Extract dynamic field headers from the first submission's form definition
    const dynamicFields = [];
    if (submissions[0].formId?.fields) {
      submissions[0].formId.fields.forEach(field => {
        dynamicFields.push({ id: field.id, label: field.label });
      });
    }

    const headers = [
      'Submission ID',
      'Form',
      'Worker',
      'Event',
      'State',
      'City',
      'Village',
      'Submitted At',
      'Status',
      ...dynamicFields.map(f => f.label)
    ];

    const rows = submissions.map(sub => {
      const basicInfo = [
        sub._id,
        sub.formId?.title || 'Untitled',
        sub.workerId?.name || sub.workerName || 'Unknown',
        sub.eventId?.name || '—',
        sub.location?.state || '—',
        sub.location?.city || '—',
        sub.location?.village || '—',
        new Date(sub.submittedAt).toLocaleString(),
        sub.status,
      ];

      const dynamicValues = dynamicFields.map(f => {
        const val = sub.responses ? sub.responses[f.id] : '';
        if (Array.isArray(val)) return val.join('; ');
        return val || '';
      });

      return [...basicInfo, ...dynamicValues];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Filename convention: EventName_FormName_Submissions.csv
    const eventName = (submissions[0].eventId?.name || 'Event').replace(/\s+/g, '_');
    const formName = (submissions[0].formId?.title || 'Form').replace(/\s+/g, '_');
    const filename = `${eventName}_${formName}_Submissions.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activityTypes = ['Training', 'Awareness Program', 'Food Distribution', 'Health Camp', 'Survey', 'Meeting'];
  const regions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];
  const issueTypes = ['Water Shortage', 'Low Attendance', 'Rain / Weather', 'Resource Shortage', 'Transport Issues', 'Technical Issues'];

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={filters.eventId}
            onChange={e => handleFilterChange('eventId', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Event</option>
            {availableEvents.map(event => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>

          <select
            value={filters.formId}
            onChange={e => handleFilterChange('formId', e.target.value)}
            disabled={!filters.eventId}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Form</option>
            {availableForms.map(form => (
              <option key={form.formId} value={form.formId}>
                {form.title}
              </option>
            ))}
          </select>

          <select
            value={filters.workerId}
            onChange={e => handleFilterChange('workerId', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by Worker</option>
            {availableWorkers.map(worker => (
              <option key={worker._id} value={worker._id}>
                {worker.name}{worker.email ? ` (${worker.email})` : ''}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={e => handleFilterChange('startDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={e => handleFilterChange('endDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={downloadAsCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <FiDownload className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Submissions table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No submissions found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Form</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Worker</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Event</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map(submission => (
                  <tr key={submission._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {submission.formId?.title || 'Untitled Form'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {submission.workerId?.name || submission.workerName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {submission.eventId?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => navigate(`/admin/submissions/${submission._id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.pages} • {pagination.total} total submissions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsViewer;
