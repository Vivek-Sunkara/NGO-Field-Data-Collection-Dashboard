import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCalendar, FiMapPin, FiArrowRight, FiSearch } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import api from '@/api/client';
import Loading from '@/components/Loading';

const WorkerSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forms/submissions');
      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.formId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
            <p className="text-gray-600 mt-1">Review all your submitted field data</p>
          </div>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by form, event, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <FiFileText className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <p className="text-xl font-semibold text-gray-600">No submissions found</p>
            <p className="text-gray-400 mt-2">Forms you submit will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => (
              <div 
                key={sub._id}
                onClick={() => navigate(`/worker/submissions/${sub._id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {sub.formId?.title || 'Untitled Form'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="text-blue-500" /> {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        Event: {sub.eventId?.name || '—'}
                      </span>
                      {sub.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="text-red-500" /> {sub.location.state}, {sub.location.city}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Submitted
                    </span>
                    <FiArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WorkerSubmissions;
