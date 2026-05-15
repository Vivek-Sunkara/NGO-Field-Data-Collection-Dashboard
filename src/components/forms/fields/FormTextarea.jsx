import React from 'react';

const FormTextarea = ({ field, value, onChange, error, disabled = false }) => {
  const charLimit = field.validation?.maxLength;
  const currentLength = (value || '').length;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-gray-500 mb-2">{field.description}</p>
      )}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder || ''}
        disabled={disabled}
        rows="4"
        maxLength={charLimit}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {charLimit && (
        <p className="text-xs text-gray-500 mt-1">
          {currentLength} / {charLimit} characters
        </p>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormTextarea;
