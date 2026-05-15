import React from 'react';

const FormCheckboxGroup = ({ field, value = [], onChange, error, disabled = false }) => {
  const handleToggle = (option) => {
    const newValue = Array.isArray(value) ? [...value] : [];
    if (newValue.includes(option)) {
      newValue.splice(newValue.indexOf(option), 1);
    } else {
      newValue.push(option);
    }
    onChange(field.id, newValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-gray-500 mb-2">{field.description}</p>
      )}
      <div className="space-y-2">
        {field.options?.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={Array.isArray(value) && value.includes(option)}
              onChange={() => handleToggle(option)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FormCheckboxGroup;
