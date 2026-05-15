import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft, FiSave, FiSend, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/useAuth';
import ActivityDetailsStep from '../../components/forms/steps/ActivityDetailsStep';
import ParticipationStep from '../../components/forms/steps/ParticipationStep';
import IssuesStep from '../../components/forms/steps/IssuesStep';
import ReviewStep from '../../components/forms/steps/ReviewStep';
import api from '@/api/client';
import Toast from '@/components/Toast';

const STEPS = [
  { id: 1, title: 'Activity Details', component: ActivityDetailsStep },
  { id: 2, title: 'Participation', component: ParticipationStep },
  { id: 3, title: 'Issues & Evidence', component: IssuesStep },
  { id: 4, title: 'Review & Submit', component: ReviewStep },
];

const FieldSubmissionForm = ({ draftId = null, onSuccess = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { draftId: urlDraftId } = useParams();
  const actualDraftId = draftId || urlDraftId || null;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Section 1
    activityType: '',
    activityTitle: '',
    activityDate: new Date().toISOString().split('T')[0],
    region: '',
    locationDetails: '',

    // Section 2
    totalParticipants: '',
    maleCount: '',
    femaleCount: '',
    childrenCount: '',
    beneficiaryCategory: '',

    // Section 3
    issuesTags: [],
    additionalNotes: '',
    evidenceImages: [],

    // Metadata
    draftId: draftId || null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Load draft if provided
  useEffect(() => {
    if (actualDraftId) {
      loadDraft();
    }
  }, [actualDraftId]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/submissions/draft/${actualDraftId}`);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          ...response.data.data,
          draftId: actualDraftId,
        }));
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to load draft',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const payload = {
        workerId: user.id,
        workerName: user.name,
        draftId: formData.draftId,
        ...formData,
      };

      const response = await api.post('/submissions/draft', payload);

      if (response.data.success) {
        setToast({
          type: 'success',
          message: 'Draft saved successfully',
        });
        setFormData(prev => ({
          ...prev,
          draftId: response.data.data._id,
        }));
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save draft';
      setToast({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      const payload = {
        workerId: user.id,
        workerName: user.name,
        userRole: 'field_worker',
        workerRegion: user.region || '',
        draftId: formData.draftId,
        ...formData,
      };

      const response = await api.post('/submissions', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setToast({
          type: 'success',
          message: 'Submission successful! Redirecting...',
        });
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/worker/dashboard');
        }, 2000);
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
        setToast({
          type: 'error',
          message: 'Please fix the errors below',
        });
      } else {
        setToast({
          type: 'error',
          message: errorData?.message || 'Submission failed',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/worker/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <FiArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Submit Field Activity</h1>
          <p className="text-gray-600 text-sm mt-1">Step {currentStep} of {STEPS.length}</p>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map(step => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
              >
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
          {/* Errors display */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 mb-2">Please fix these errors:</p>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <CurrentStepComponent
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        </div>

        {/* Toast notification */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
          >
            <FiChevronLeft /> Previous
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition"
          >
            <FiSave className="h-4 w-4" /> Save Draft
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Next <FiChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
            >
              <FiSend className="h-4 w-4" /> Submit
            </button>
          )}
        </div>

        {/* Info text */}
        <p className="text-xs text-gray-600 text-center mt-4">
          All data will be automatically tagged with your worker ID and submission time.
        </p>
      </div>
    </MainLayout>
  );
};

export default FieldSubmissionForm;
