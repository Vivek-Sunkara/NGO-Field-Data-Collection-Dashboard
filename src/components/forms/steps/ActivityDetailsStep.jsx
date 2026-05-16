import React from 'react';
import { LEGACY_FORM_UI, getLegacyEnglishOptions } from '@/constants/legacyFormSchema';

const ActivityDetailsStep = ({ formData, onChange, errors, ui = LEGACY_FORM_UI }) => {
  const english = getLegacyEnglishOptions(ui);
  const { labels, placeholders } = ui;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {labels.activityType} <span className="text-red-600">*</span>
        </label>
        <select
          value={formData.activityType}
          onChange={(e) => onChange('activityType', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.activityType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{placeholders.activityType}</option>
          {english.activityTypes.map((type, index) => (
            <option key={type} value={type}>
              {ui.activityTypes[index] || type}
            </option>
          ))}
        </select>
        {errors.activityType && (
          <p className="text-red-600 text-sm mt-1">{errors.activityType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {labels.activityTitle} <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.activityTitle}
          onChange={(e) => onChange('activityTitle', e.target.value)}
          placeholder={placeholders.activityTitle}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.activityTitle ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.activityTitle && (
          <p className="text-red-600 text-sm mt-1">{errors.activityTitle}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {labels.activityDate} <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          value={formData.activityDate}
          onChange={(e) => onChange('activityDate', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.activityDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.activityDate && (
          <p className="text-red-600 text-sm mt-1">{errors.activityDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {labels.region} <span className="text-red-600">*</span>
        </label>
        <select
          value={formData.region}
          onChange={(e) => onChange('region', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.region ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{placeholders.region}</option>
          {english.regions.map((region, index) => (
            <option key={region} value={region}>
              {ui.regions[index] || region}
            </option>
          ))}
        </select>
        {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {labels.locationDetails}
        </label>
        <input
          type="text"
          value={formData.locationDetails}
          onChange={(e) => onChange('locationDetails', e.target.value)}
          placeholder={placeholders.locationDetails}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.locationDetails ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.locationDetails && (
          <p className="text-red-600 text-sm mt-1">{errors.locationDetails}</p>
        )}
      </div>
    </div>
  );
};

export default ActivityDetailsStep;
