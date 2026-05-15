import React, { useEffect } from 'react';

const ParticipationStep = ({ formData, onChange, errors }) => {
  const beneficiaryCategories = ['Farmers', 'Students', 'Women', 'Children', 'Senior Citizens', 'General Public'];

  // Auto-calculate validation on participant counts
  useEffect(() => {
    const male = parseInt(formData.maleCount) || 0;
    const female = parseInt(formData.femaleCount) || 0;
    const total = parseInt(formData.totalParticipants) || 0;

    if (male + female > total && total > 0) {
      // Would trigger error in parent validation
    }
  }, [formData.maleCount, formData.femaleCount, formData.totalParticipants]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Total Participants <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.totalParticipants}
          onChange={e => onChange('totalParticipants', e.target.value)}
          placeholder="0"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.totalParticipants ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.totalParticipants && (
          <p className="text-red-600 text-sm mt-1">{errors.totalParticipants}</p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-gray-700 mb-4">Participant Breakdown</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Male <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.maleCount}
              onChange={e => onChange('maleCount', e.target.value)}
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.maleCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maleCount && (
              <p className="text-red-600 text-sm mt-1">{errors.maleCount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Female <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.femaleCount}
              onChange={e => onChange('femaleCount', e.target.value)}
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.femaleCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.femaleCount && (
              <p className="text-red-600 text-sm mt-1">{errors.femaleCount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Children (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.childrenCount}
              onChange={e => onChange('childrenCount', e.target.value)}
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.childrenCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.childrenCount && (
              <p className="text-red-600 text-sm mt-1">{errors.childrenCount}</p>
            )}
          </div>
        </div>

        {errors.participantMismatch && (
          <p className="text-red-600 text-sm mt-4 font-semibold">{errors.participantMismatch}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Beneficiary Category <span className="text-red-600">*</span>
        </label>
        <select
          value={formData.beneficiaryCategory}
          onChange={e => onChange('beneficiaryCategory', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.beneficiaryCategory ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select beneficiary category</option>
          {beneficiaryCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.beneficiaryCategory && (
          <p className="text-red-600 text-sm mt-1">{errors.beneficiaryCategory}</p>
        )}
      </div>

      <p className="text-xs text-gray-500 bg-amber-50 p-3 rounded">
        ⚠️ Note: Male + Female count cannot exceed total participants.
      </p>
    </div>
  );
};

export default ParticipationStep;
