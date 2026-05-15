import React from 'react';

const ActivityDetailsStep = ({ formData, onChange, errors }) => {
  const activityTypes = ['Training', 'Awareness Program', 'Food Distribution', 'Health Camp', 'Survey', 'Meeting'];
  
  // Mock regions - can be fetched from API
  const regions = [
    'North Region',
    'South Region',
    'East Region',
    'West Region',
    'Central Region',
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Activity Type <span className="text-red-600">*</span>
        </label>
        <select
          value={formData.activityType}
          onChange={e => onChange('activityType', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.activityType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select an activity type</option>
          {activityTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.activityType && (
          <p className="text-red-600 text-sm mt-1">{errors.activityType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Activity Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.activityTitle}
          onChange={e => onChange('activityTitle', e.target.value)}
          placeholder="e.g., Health Camp - Village X"
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
          Activity Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          value={formData.activityDate}
          onChange={e => onChange('activityDate', e.target.value)}
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
          Region / Village <span className="text-red-600">*</span>
        </label>
        <select
          value={formData.region}
          onChange={e => onChange('region', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.region ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a region</option>
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && (
          <p className="text-red-600 text-sm mt-1">{errors.region}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Location Details (Optional)
        </label>
        <input
          type="text"
          value={formData.locationDetails}
          onChange={e => onChange('locationDetails', e.target.value)}
          placeholder="e.g., Community Center, Near Market"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.locationDetails ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.locationDetails && (
          <p className="text-red-600 text-sm mt-1">{errors.locationDetails}</p>
        )}
      </div>

      <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
        💡 Tip: Enter clear, descriptive activity details to help track your work effectively.
      </p>
    </div>
  );
};

export default ActivityDetailsStep;
