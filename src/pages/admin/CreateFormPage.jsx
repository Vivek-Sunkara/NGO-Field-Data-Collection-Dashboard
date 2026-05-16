import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiChevronDown, FiLock, FiInfo, FiMapPin, FiUser, FiClock } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import api from '@/api/client';
import { showToast, TOAST_TYPES } from '@/utils/toast';
import Loading from '@/components/Loading';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'date', label: 'Date' },
  { value: 'image', label: 'Image Upload' },
];

const CreateFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const eventId = searchParams.get('eventId');
  const editFormId = searchParams.get('formId');

  const [formData, setFormData] = useState({
    title: '',
    expiryDate: '',
    fields: [],
    eventId: '',
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedFieldId, setExpandedFieldId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchFormDetails = async (formId) => {
    try {
      const response = await api.get(`/admin/forms/${formId}`);
      if (response.data.success) {
        const form = response.data.data;
        setFormData({
          title: form.title || '',
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString().slice(0, 16) : '',
          fields: form.fields || [],
          eventId: form.eventId || '',
        });
      }
    } catch (err) {
      console.error('Error fetching form details:', err);
      showToast('Failed to load form details for editing', TOAST_TYPES.ERROR);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events?limit=100');
      if (response.data.success) {
        setEvents(response.data.data);
        if (eventId && !editFormId) {
          setFormData(prev => ({ ...prev, eventId }));
        }
        if (editFormId) {
          await fetchFormDetails(editFormId);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      showToast('Failed to load events', TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: '',
      description: '',
      validation: {},
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Form title is required';
    }

    if (!formData.eventId) {
      newErrors.eventId = 'Event is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    if (formData.fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    // Validate each field
    formData.fields.forEach(field => {
      if (!field.label.trim()) {
        newErrors[`${field.id}_label`] = 'Field label is required';
      }

      if (['dropdown', 'checkbox', 'radio'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          newErrors[`${field.id}_options`] = 'Add at least one option';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix all errors before submitting', TOAST_TYPES.WARNING);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        expiryDate: formData.expiryDate,
        fields: formData.fields,
      };

      if (!editFormId) {
        payload.eventId = formData.eventId;
      }

      const response = editFormId
        ? await api.put(`/admin/forms/${editFormId}`, payload)
        : await api.post('/admin/forms', payload);

      if (response.data.success) {
        showToast(
          editFormId ? 'Form updated successfully' : 'Form created successfully',
          TOAST_TYPES.SUCCESS
        );
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating form:', err);
      showToast(
        err.response?.data?.message || 'Failed to create form',
        TOAST_TYPES.ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitle = editFormId ? 'Edit Form' : 'Create New Form';
  const submitLabel = editFormId ? 'Save Changes' : 'Create Form';

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-2">
            {editFormId
              ? 'Update the form fields and expiry date.'
              : 'Create a dynamic form with custom fields'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Form Details</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Health Survey, Feedback Form"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.eventId || ''}
                  onChange={e =>
                    setFormData({ ...formData, eventId: e.target.value })
                  }
                  disabled={!!editFormId}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.eventId ? 'border-red-500' : 'border-gray-300'
                  } ${editFormId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Select Event --</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name}
                    </option>
                  ))}
                </select>
                {errors.eventId && (
                  <p className="text-red-500 text-sm mt-1">{errors.eventId}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={e =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>
            </div>
          
          {/* System Mandatory Fields Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiLock className="text-gray-500" />
              <h2 className="text-lg font-bold text-gray-800">System Mandatory Fields</h2>
              <span className="ml-auto text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Automatic</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
              <FiInfo className="mt-0.5 flex-shrink-0 text-blue-500" />
              These fields are automatically captured for every submission and do not need to be added manually.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <FiMapPin className="text-red-500" />
                <div className="text-xs">
                  <p className="font-bold text-gray-700">GPS Location</p>
                  <p className="text-gray-500">Lat, Long (Mandatory)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <FiUser className="text-blue-500" />
                <div className="text-xs">
                  <p className="font-bold text-gray-700">Worker Metadata</p>
                  <p className="text-gray-500">Name, ID, Role</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <FiClock className="text-purple-500" />
                <div className="text-xs">
                  <p className="font-bold text-gray-700">Timestamps</p>
                  <p className="text-gray-500">Submitted & Updated At</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg opacity-60">
                <FiInfo className="text-gray-500" />
                <div className="text-xs">
                  <p className="font-bold text-gray-700">Device Info</p>
                  <p className="text-gray-500">IP & Browser Metadata</p>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Fields Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Form Fields</h2>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FiPlus /> Add Field
              </button>
            </div>

            {errors.fields && (
              <p className="text-red-500 text-sm mb-4">{errors.fields}</p>
            )}

            {formData.fields.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No fields yet. Click "Add Field" to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="border border-gray-300 rounded-lg overflow-hidden"
                  >
                    {/* Field Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFieldId(
                          expandedFieldId === field.id ? null : field.id
                        )
                      }
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition"
                    >
                      <span className="font-medium text-gray-900">
                        {field.label || `Field ${idx + 1}`} ({field.type})
                      </span>
                      <FiChevronDown
                        className={`transition ${
                          expandedFieldId === field.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Field Content */}
                    {expandedFieldId === field.id && (
                      <div className="p-4 space-y-4 border-t">
                        {/* Label */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Label <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={e =>
                              updateField(field.id, { label: e.target.value })
                            }
                            placeholder="e.g., Full Name"
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`${field.id}_label`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          />
                          {errors[`${field.id}_label`] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors[`${field.id}_label`]}
                            </p>
                          )}
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Type
                          </label>
                          <select
                            value={field.type}
                            onChange={e =>
                              updateField(field.id, { type: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {FIELD_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Options (for dropdown, checkbox, radio) */}
                        {['dropdown', 'checkbox', 'radio'].includes(
                          field.type
                        ) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Options <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              {(field.options || []).map((option, oIdx) => (
                                <div key={oIdx} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={e => {
                                      const newOptions = [...field.options];
                                      newOptions[oIdx] = e.target.value;
                                      updateField(field.id, {
                                        options: newOptions,
                                      });
                                    }}
                                    placeholder={`Option ${oIdx + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOptions = field.options.filter(
                                        (_, i) => i !== oIdx
                                      );
                                      updateField(field.id, {
                                        options: newOptions,
                                      });
                                    }}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  updateField(field.id, {
                                    options: [...(field.options || []), ''],
                                  });
                                }}
                                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition"
                              >
                                + Add Option
                              </button>
                            </div>
                            {errors[`${field.id}_options`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`${field.id}_options`]}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Placeholder */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={e =>
                              updateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Help text for the field"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={field.description || ''}
                            onChange={e =>
                              updateField(field.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Additional context for the worker"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Required Checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e =>
                              updateField(field.id, { required: e.target.checked })
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Required field
                          </span>
                        </label>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="w-full px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition flex items-center justify-center gap-2"
                        >
                          <FiTrash2 /> Remove Field
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FiPlus /> {submitting ? (editFormId ? 'Saving...' : 'Creating...') : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateFormPage;
