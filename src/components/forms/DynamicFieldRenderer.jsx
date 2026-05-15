import React from 'react';
import FormTextInput from './fields/FormTextInput';
import FormTextarea from './fields/FormTextarea';
import FormDropdown from './fields/FormDropdown';
import FormCheckboxGroup from './fields/FormCheckboxGroup';
import FormRadioGroup from './fields/FormRadioGroup';
import FormDatePicker from './fields/FormDatePicker';
import FormFileUpload from './fields/FormFileUpload';

const DynamicFieldRenderer = ({ field, value, onChange, errors = {}, disabled = false }) => {
  const error = errors[field.id];

  switch (field.type) {
    case 'text':
    case 'number':
      return (
        <FormTextInput
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'textarea':
      return (
        <FormTextarea
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'dropdown':
      return (
        <FormDropdown
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'checkbox':
      return (
        <FormCheckboxGroup
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <FormRadioGroup
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <FormDatePicker
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'image':
      return (
        <FormFileUpload
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    default:
      return <div className="text-red-500 text-sm">Unknown field type: {field.type}</div>;
  }
};

export default DynamicFieldRenderer;
