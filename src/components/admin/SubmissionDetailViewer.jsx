import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiCheck, FiMapPin, FiCalendar } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';

const SubmissionDetailViewer = ({ isWorkerView = false }) => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissionDetail();
  }, [submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = isWorkerView 
        ? `/forms/submission/${submissionId}` 
        : `/admin/submissions/${submissionId}`;
      const response = await api.get(endpoint);
      if (response.data.success) {
        setSubmission(response.data.data);
      } else {
        setError('Failed to load submission details');
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
      setError('Failed to load submission details');
      showToast('Failed to load submission', TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const renderFieldValue = (field, value) => {
    if (!value) return <span className="text-gray-400">No response</span>;

    switch (field.type) {
      case 'image':
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Upload ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          );
        }
        return (
          <img src={value} alt="Submission" className="max-w-xs rounded border" />
        );

      case 'checkbox':
        if (Array.isArray(value)) {
          return (
            <div className="space-y-1">
              {value.map((item, idx) => (
                <div key={idx} className="text-gray-700 flex items-center gap-2">
                  <FiCheck className="text-green-500" /> {item}
                </div>
              ))}
            </div>
          );
        }
        break;

      case 'textarea':
        return (
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
            {value}
          </p>
        );

      case 'date':
        return (
          <span className="text-gray-700">
            {new Date(value).toLocaleDateString()}
          </span>
        );

      default:
        return <span className="text-gray-700">{String(value)}</span>;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (!submission) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="text-center text-gray-500 py-8">
            Submission not found
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {submission.formId?.title}
              </h1>
              <p className="text-gray-600">
                Event: {submission.eventId?.name}
              </p>
              <p className="text-gray-600">
                Worker: {submission.workerName} ({submission.workerId?.email})
              </p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FiCalendar className="text-blue-500" />
                  <strong>Activity:</strong> {new Date(submission.activityDate).toLocaleDateString()}
                </div>
                {submission.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FiMapPin className="text-red-500" />
                    <strong>Location:</strong> {submission.location.state}, {submission.location.city} {submission.location.village ? `(${submission.location.village})` : ''}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {submission.status}
              </span>
            </div>
          </div>
        </div>

        {/* Responses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Responses</h2>
          {submission.formId?.fields?.map((field) => (
            <div key={field.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
                {field.description && (
                  <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                )}
              </div>
              <div className="text-base">
                {renderFieldValue(field, submission.responses[field.id])}
              </div>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Submission Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">IP Address</p>
              <p className="font-mono text-gray-900">{submission.ipAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Device Info</p>
              <p className="font-mono text-gray-900 truncate">
                {submission.deviceInfo}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-gray-900">
                {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-gray-900">
                {new Date(submission.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubmissionDetailViewer;
