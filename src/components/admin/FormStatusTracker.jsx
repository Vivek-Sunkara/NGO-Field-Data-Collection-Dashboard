import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiClock, 
  FiFileText, 
  FiAlertCircle, 
  FiUser,
  FiArrowLeft
} from 'react-icons/fi';
import api from '@/api/client';
import Loading from '@/components/Loading';

const FormStatusTracker = ({ formId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formId) {
      fetchStatus();
    }
  }, [formId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/forms/${formId}/status`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching form status:', err);
      setError('Failed to load submission tracking data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return (
    <div className="p-8 text-center">
      <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-600">{error}</p>
      <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go Back</button>
    </div>
  );
  if (!data) return null;

  const { metrics, workerStatus, formTitle, expiryDate, isExpired } = data;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Submitted</span>;
      case 'Draft Saved':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Draft</span>;
      case 'Expired':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Expired</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Back"
          >
            <FiArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{formTitle}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <FiClock className="h-4 w-4" />
              <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
              {isExpired && <span className="text-red-500 font-medium">(Expired)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FiUser className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{metrics.totalWorkers}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Assigned</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <FiCheckCircle className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{metrics.completedCount}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Completed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <FiFileText className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{metrics.draftCount}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Drafts Saved</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <FiClock className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{metrics.pendingCount + metrics.expiredCount}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Awaiting</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Overall Completion Progress</h3>
          <span className="text-sm font-bold text-blue-600">{metrics.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(metrics.completionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Worker Status Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Worker Status Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Worker Name</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workerStatus.map((worker) => (
                <tr key={worker.workerId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{worker.name}</span>
                      <span className="text-xs text-gray-500">{worker.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {worker.location ? `${worker.location.state}, ${worker.location.city}` : worker.region || '—'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(worker.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {worker.submissionDate ? new Date(worker.submissionDate).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormStatusTracker;
