import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const ReviewStep = ({ formData }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const SectionCard = ({ title, children }) => (
    <div className="border-l-4 border-blue-600 pl-4 py-4">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <FiCheckCircle className="text-green-600" /> {title}
      </h3>
      {children}
    </div>
  );

  const FieldRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-200">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-green-800 font-semibold">
          ✓ Please review your submission below before submitting.
        </p>
      </div>

      {/* Activity Details */}
      <SectionCard title="Activity Details">
        <FieldRow label="Activity Type" value={formData.activityType} />
        <FieldRow label="Title" value={formData.activityTitle} />
        <FieldRow label="Date" value={formatDate(formData.activityDate)} />
        <FieldRow label="Region" value={formData.region} />
        <FieldRow label="Location Details" value={formData.locationDetails} />
      </SectionCard>

      {/* Participation */}
      <SectionCard title="Participation Details">
        <FieldRow label="Total Participants" value={formData.totalParticipants} />
        <FieldRow label="Male" value={formData.maleCount} />
        <FieldRow label="Female" value={formData.femaleCount} />
        <FieldRow label="Children" value={formData.childrenCount || '0'} />
        <FieldRow label="Beneficiary Category" value={formData.beneficiaryCategory} />
      </SectionCard>

      {/* Issues & Notes */}
      <SectionCard title="Issues & Observations">
        <div className="mb-3">
          <p className="text-gray-600 font-medium mb-2">Issues Faced:</p>
          {formData.issuesTags && formData.issuesTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.issuesTags.map(tag => (
                <span key={tag} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No issues reported</p>
          )}
        </div>

        <div className="mt-4">
          <p className="text-gray-600 font-medium mb-2">Additional Notes:</p>
          <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">
            {formData.additionalNotes || '(No notes added)'}
          </p>
        </div>
      </SectionCard>

      {/* Evidence */}
      <SectionCard title="Evidence Images">
        {formData.evidenceImages && formData.evidenceImages.length > 0 ? (
          <p className="text-gray-800 font-semibold">
            {formData.evidenceImages.length} image{formData.evidenceImages.length !== 1 ? 's' : ''} ready to upload
          </p>
        ) : (
          <p className="text-gray-500 text-sm">No images attached</p>
        )}
      </SectionCard>

      {/* Metadata Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">ℹ️ Auto-populated metadata:</span>
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>✓ Worker ID & Name</li>
          <li>✓ Submission Timestamp</li>
          <li>✓ User Role: Field Worker</li>
          <li>✓ IP Address & Device Info</li>
        </ul>
      </div>

      <p className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
        Once you submit, your submission will be reviewed by the admin. You cannot edit submissions after they are submitted, but you can save drafts for later completion.
      </p>
    </div>
  );
};

export default ReviewStep;
