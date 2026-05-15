import React, { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

const FormFileUpload = ({ field, value = [], onChange, error, disabled = false }) => {
  const [preview, setPreview] = useState(value || []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (const file of files) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        alert(`${file.name} is not a valid image format (JPEG, PNG, WebP, GIF)`);
        continue;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total files
    if (preview.length + validFiles.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }

    const newPreview = [...preview];
    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreview.push({
          id: Date.now() + Math.random(),
          src: e.target.result,
          file,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }

    setTimeout(() => {
      setPreview(newPreview);
      onChange(field.id, validFiles);
    }, 100);
  };

  const handleRemove = (id) => {
    const newPreview = preview.filter((p) => p.id !== id);
    setPreview(newPreview);
    onChange(field.id, newPreview.map(p => p.file).filter(Boolean));
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

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          disabled
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : 'border-blue-300 bg-blue-50 hover:border-blue-500'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id={`file-input-${field.id}`}
        />
        <label htmlFor={`file-input-${field.id}`} className="cursor-pointer">
          <FiUpload className="mx-auto h-8 w-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-700 mb-1">
            {disabled ? 'Form is read-only' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF up to 5MB each (max 10 files)</p>
        </label>
      </div>

      {/* Preview gallery */}
      {preview.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {preview.length} file(s) selected
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {preview.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={disabled}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition disabled:cursor-not-allowed"
                >
                  <FiX className="h-4 w-4" />
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FormFileUpload;
