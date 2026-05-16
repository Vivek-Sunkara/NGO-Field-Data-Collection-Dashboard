import React, { useEffect } from 'react';
import { LEGACY_FORM_UI, getLegacyEnglishOptions } from '@/constants/legacyFormSchema';

const ParticipationStep = ({ formData, onChange, errors, ui = LEGACY_FORM_UI }) => {
  const english = getLegacyEnglishOptions(ui);
  const { labels, placeholders } = ui;

  useEffect(() => {
    const male = parseInt(formData.maleCount) || 0;
    const female = parseInt(formData.femaleCount) || 0;
    const total = parseInt(formData.totalParticipants) || 0;
    if (male + female > total && total > 0) {
      // Parent validation handles mismatch
    }
  }, [formData.maleCount, formData.femaleCount, formData.totalParticipants]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {labels.totalParticipants} <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.totalParticipants}
          onChange={(e) => onChange('totalParticipants', e.target.value)}
          placeholder={placeholders.totalParticipants}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.totalParticipants ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.totalParticipants && (
          <p className="text-red-600 text-sm mt-1">{errors.totalParticipants}</p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-gray-700 mb-4">{labels.participantBreakdown}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {labels.maleCount} <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.maleCount}
              onChange={(e) => onChange('maleCount', e.target.value)}
              placeholder={placeholders.maleCount}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.maleCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maleCount && <p className="text-red-600 text-sm mt-1">{errors.maleCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {labels.femaleCount} <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.femaleCount}
              onChange={(e) => onChange('femaleCount', e.target.value)}
              placeholder={placeholders.femaleCount}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.femaleCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.femaleCount && <p className="text-red-600 text-sm mt-1">{errors.femaleCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.childrenCount}</label>
            <input
              type="number"
              min="0"
              value={formData.childrenCount}
              onChange={(e) => onChange('childrenCount', e.target.value)}
              placeholder={placeholders.childrenCount}
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
          {labels.beneficiaryCategory} <span className="text-red-600">*</span>
        </label>
        <select
          value={formData.beneficiaryCategory}
          onChange={(e) => onChange('beneficiaryCategory', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.beneficiaryCategory ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select beneficiary category</option>
          {english.beneficiaryCategories.map((category, index) => (
            <option key={category} value={category}>
              {ui.beneficiaryCategories[index] || category}
            </option>
          ))}
        </select>
        {errors.beneficiaryCategory && (
          <p className="text-red-600 text-sm mt-1">{errors.beneficiaryCategory}</p>
        )}
      </div>
    </div>
  );
};

export default ParticipationStep;
