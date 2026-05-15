import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft, FiSave, FiSend, FiAlertCircle, FiArrowLeft, FiClock, FiCheckCircle, FiMapPin, FiCalendar } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/useAuth';
import DynamicFieldRenderer from '@/components/forms/DynamicFieldRenderer';
import api from '@/api/client';
import Toast from '@/components/Toast';

const WorkerFormPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, capturing, success, error
  const [locationError, setLocationError] = useState(null);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);

  const STATE_CITY_DATA = {
    'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar'],
    'Karnataka': ['Bengaluru', 'Mysuru'],
    'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam']
  };

  useEffect(() => {
    fetchForm();
    checkFormStatus();
  }, [formId]);

  const handleLocationChange = (field, value) => {
    setLocation(prev => {
      const newLoc = { ...prev, [field]: value };
      if (field === 'state') {
        newLoc.city = ''; // Reset city when state changes
      }
      return newLoc;
    });
  };

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/forms/form/${formId}`);

      if (response.data.success) {
        const formData = response.data.data;
        setForm(formData);
        setIsExpired(formData.isExpired);

        // Load draft if exists
        if (!formData.isExpired) {
          loadDraft();
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch form';
      setToast({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFormStatus = async () => {
    try {
      const response = await api.get(`/forms/status/${formId}`);
      if (response.data.success) {
        setFormStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to check form status', error);
    }
  };

  const loadDraft = async () => {
    try {
      const response = await api.get(`/forms/draft/${formId}`);
      if (response.data.success && response.data.data?.responses) {
        setResponses(response.data.data.responses);
        if (response.data.data.activityDate) {
          setActivityDate(new Date(response.data.data.activityDate).toISOString().split('T')[0]);
        }
        if (response.data.data.location) {
          setLocation(response.data.data.location);
          setLocationStatus('success');
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
      // Draft doesn't exist yet, that's okay
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      await api.post('/forms/draft', {
        formId,
        eventId: form?.eventId._id,
        responses,
        location,
        activityDate,
      });

      setToast({
        type: 'success',
        message: 'Draft saved successfully',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save draft';
      setToast({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrors({});

      // Identify and upload images first
      const finalResponses = { ...responses };
      const imageUploadPromises = [];

      form.fields.forEach(field => {
        if (field.type === 'image' && responses[field.id]) {
          const files = Array.isArray(responses[field.id]) ? responses[field.id] : [responses[field.id]];
          
          // Only upload if they are actually File objects
          const filesToUpload = files.filter(f => f instanceof File);
          
          if (filesToUpload.length > 0) {
            const formData = new FormData();
            filesToUpload.forEach(file => {
              formData.append('images', file);
            });

            const uploadPromise = api.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            }).then(response => {
              if (response.data.success) {
                // Combine existing URLs (if any) with new uploaded URLs
                const existingUrls = files.filter(f => typeof f === 'string');
                const newUrls = response.data.files.map(f => f.url);
                finalResponses[field.id] = [...existingUrls, ...newUrls];
              }
            });
            imageUploadPromises.push(uploadPromise);
          }
        }
      });

      // Wait for all uploads to complete
      if (imageUploadPromises.length > 0) {
        await Promise.all(imageUploadPromises);
      }

      const response = await api.post('/forms/submit', {
        formId,
        eventId: form?.eventId._id,
        responses: finalResponses,
        location,
        activityDate,
      });

      if (response.data.success) {
        setToast({
          type: 'success',
          message: 'Form submitted successfully! Redirecting...',
        });

        setTimeout(() => {
          navigate('/worker/events');
        }, 2000);
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
        setToast({
          type: 'error',
          message: 'Please fix the validation errors',
        });
      } else {
        setToast({
          type: 'error',
          message: errorData?.message || 'Submission failed',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Form not found</p>
          <button
            onClick={() => navigate('/worker/events')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Calculate fields per step (split into 3 steps: form details, questions, review)
  const fieldsPerStep = Math.ceil(form.fields.length / 2) || 1;
  const STEPS = [
    { id: 1, title: 'Form Details' },
    { id: 2, title: 'Questions' },
    { id: 3, title: 'Review & Submit' },
  ];

  const getCurrentStepFields = () => {
    const startIdx = (currentStep - 1) * fieldsPerStep;
    const endIdx = currentStep * fieldsPerStep;
    return form.fields.slice(startIdx, endIdx);
  };

  const currentStepFields = getCurrentStepFields();
  const hasNextStep = currentStep < STEPS.length;
  const canGoNext = currentStepFields.every(
    field => !field.required || (responses[field.id] !== undefined && responses[field.id] !== null && responses[field.id] !== '')
  ) && (currentStep !== 1 || (location?.state && location?.city));

  const formatExpiryDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const availableCities = location?.state ? STATE_CITY_DATA[location.state] || [] : [];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/worker/events')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <FiArrowLeft className="h-4 w-4" /> Back to Events
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-1">{form.title}</h1>

          {/* Expiry warning */}
          {isExpired ? (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <FiAlertCircle className="h-4 w-4" /> Form has expired
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
              <FiClock className="h-4 w-4" /> Expires: {formatExpiryDate(form.expiryDate)}
            </div>
          )}

          {/* Progress */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Step {currentStep} of {STEPS.length}
            </p>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.id === currentStep
                      ? 'bg-blue-600 text-white'
                      : step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <p className="text-xs text-center mt-1 text-gray-600">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 mb-2">Please fix these errors:</p>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(errors).map(([fieldId, message]) => (
                    <li key={fieldId}>• {message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Submission Context</h2>
                
                {/* Event Info */}
                {form.eventId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Event:</strong> {form.eventId.name}
                    </p>
                  </div>
                )}

                {/* Activity Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline mr-1" /> Field Activity Date
                  </label>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specify when the activity actually took place.</p>
                </div>

                {/* Location Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Location Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                      <select
                        value={location?.state || ''}
                        onChange={(e) => handleLocationChange('state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select State --</option>
                        {Object.keys(STATE_CITY_DATA).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City/District <span className="text-red-500">*</span></label>
                      {location?.state && availableCities.length === 0 ? (
                        <input
                          type="text"
                          value={location?.city || ''}
                          onChange={(e) => handleLocationChange('city', e.target.value)}
                          placeholder="Enter city manually"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <select
                          value={location?.city || ''}
                          onChange={(e) => handleLocationChange('city', e.target.value)}
                          disabled={!location?.state}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        >
                          <option value="">-- Select City --</option>
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Village */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village/Area (Optional)</label>
                    <input
                      type="text"
                      value={location?.village || ''}
                      onChange={(e) => handleLocationChange('village', e.target.value)}
                      placeholder="e.g. Rampur Village"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStepFields.map((field) => (
              <div key={field.id}>
                <DynamicFieldRenderer
                  field={field}
                  value={responses[field.id]}
                  onChange={handleFieldChange}
                  errors={errors}
                  disabled={submitting || isExpired}
                />
              </div>
            ))}

            {currentStep === STEPS.length && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Please review your responses below before submitting. Once submitted, your data will be permanently saved.
                  </p>
                </div>

                <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
                  {form.fields.map((field) => (
                    <div key={field.id} className="p-4 bg-white hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">{field.label}</p>
                          <div className="text-gray-900">
                            {responses[field.id] ? (
                              field.type === 'image' ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {Array.isArray(responses[field.id]) ? (
                                    responses[field.id].map((img, idx) => {
                                      const src = img instanceof File ? URL.createObjectURL(img) : img;
                                      return (
                                        <img key={idx} src={src} alt="Preview" className="w-20 h-20 object-cover rounded border shadow-sm" />
                                      );
                                    })
                                  ) : (
                                    (() => {
                                      const img = responses[field.id];
                                      const src = img instanceof File ? URL.createObjectURL(img) : img;
                                      return (
                                        <img src={src} alt="Preview" className="w-20 h-20 object-cover rounded border shadow-sm" />
                                      );
                                    })()
                                  )}
                                </div>
                              ) : Array.isArray(responses[field.id]) ? (
                                <ul className="list-disc list-inside text-sm">
                                  {responses[field.id].map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm">{String(responses[field.id])}</p>
                              )
                            ) : (
                              <span className="text-sm text-gray-400 italic">No response provided</span>
                            )}
                          </div>
                        </div>
                        {field.required && responses[field.id] && (
                          <FiCheckCircle className="text-green-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || submitting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
          >
            <FiChevronLeft /> Previous
          </button>

          {!isExpired && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition"
              >
                <FiSave className="h-4 w-4" /> Save Draft
              </button>

              {hasNextStep ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canGoNext || submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Next Step <FiChevronRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canGoNext || submitting || !location?.state || !location?.city}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Form'} <FiCheckCircle />
                </button>
              )}
            </>
          )}

          {isExpired && (
            !hasNextStep ? (
              <div className="flex-1 text-center py-2 bg-red-50 text-red-700 rounded-lg font-medium border border-red-200">
                Form has expired and can no longer be submitted
              </div>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Next Step <FiChevronRight />
              </button>
            )
          )}
        </div>

        {isExpired && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center mt-4">
            <p className="text-red-700 font-medium mb-3">This form has expired and cannot be edited</p>
            <button
              onClick={() => navigate('/worker/events')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Back to Events
            </button>
          </div>
        )}

        <p className="text-xs text-gray-600 text-center mt-4">
          All responses are securely saved and timestamped.
        </p>
      </div>
    </MainLayout>
  );
};

export default WorkerFormPage;
