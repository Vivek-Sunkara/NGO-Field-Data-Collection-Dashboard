import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workerIds: [],
  });

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/admin/workers');
      if (response.data.success) {
        setWorkers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      showToast('Failed to load workers', TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) setErrors({ ...errors, name: '' });
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleWorkerToggle = (workerId) => {
    const isSelected = formData.workerIds.includes(workerId);
    setFormData({
      ...formData,
      workerIds: isSelected
        ? formData.workerIds.filter(id => id !== workerId)
        : [...formData.workerIds, workerId],
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix errors before submitting', TOAST_TYPES.WARNING);
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/admin/events', formData);

      if (response.data.success) {
        showToast('Event created successfully', TOAST_TYPES.SUCCESS);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      showToast(
        err.response?.data?.message || 'Failed to create event',
        TOAST_TYPES.ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  const selectedWorkerNames = workers
    .filter(w => formData.workerIds.includes(w._id))
    .map(w => w.name);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">
            Create an event and assign field workers to it
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Event Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Health Camp Drive, Community Survey"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the event and its objectives..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Worker Assignment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assign Field Workers
            </label>

            {/* Selected Workers Tags */}
            {selectedWorkerNames.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex flex-wrap gap-2">
                {selectedWorkerNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Worker Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
              {workers.length === 0 ? (
                <p className="text-gray-500 col-span-2">No workers available</p>
              ) : (
                workers.map(worker => (
                  <label
                    key={worker._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.workerIds.includes(worker._id)}
                      onChange={() => handleWorkerToggle(worker._id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-500">{worker.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <p className="text-sm text-gray-600 mt-2">
              {formData.workerIds.length} worker(s) selected
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-6 py-2 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FiPlus /> {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateEventPage;
