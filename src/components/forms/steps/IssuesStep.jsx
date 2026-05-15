import React, { useState, useRef } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

const IssuesStep = ({ formData, onChange, errors }) => {
  const issueOptions = ['Water Shortage', 'Low Attendance', 'Rain / Weather', 'Resource Shortage', 'Transport Issues', 'Technical Issues'];
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);

  const toggleIssueTag = (tag) => {
    const newTags = formData.issuesTags.includes(tag)
      ? formData.issuesTags.filter(t => t !== tag)
      : [...formData.issuesTags, tag];
    onChange('issuesTags', newTags);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (formData.evidenceImages.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    files.forEach(file => {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        alert(`${file.name} is not a supported image format`);
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB size limit`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            src: e.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);

      // Add to form data
      onChange('evidenceImages', [...formData.evidenceImages, file]);
    });
  };

  const removeImage = (id) => {
    setImagePreview(prev => prev.filter(img => img.id !== id));
    onChange('evidenceImages', formData.evidenceImages.slice(0, -1));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Issues Faced (Optional)
        </label>
        <p className="text-xs text-gray-600 mb-3">Select all that apply:</p>

        <div className="space-y-2">
          {issueOptions.map(issue => (
            <label key={issue} className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={formData.issuesTags.includes(issue)}
                onChange={() => toggleIssueTag(issue)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="ml-3 text-gray-700 font-medium">{issue}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={formData.additionalNotes}
          onChange={e => onChange('additionalNotes', e.target.value)}
          placeholder="Any additional comments or observations..."
          rows="4"
          maxLength="1000"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.additionalNotes ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.additionalNotes.length}/1000 characters
        </p>
        {errors.additionalNotes && (
          <p className="text-red-600 text-sm mt-1">{errors.additionalNotes}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Evidence Images (Optional)
        </label>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-100 transition"
        >
          <FiUpload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-800">Click to upload images</p>
          <p className="text-xs text-gray-600 mt-1">
            Max 10 images, 5MB each (JPEG, PNG, WebP, GIF)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Image preview grid */}
        {imagePreview.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagePreview.map(img => (
              <div key={img.id} className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={img.src}
                  alt={img.name}
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
                <p className="text-xs text-gray-700 p-2 truncate">{img.name}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-3">
          📸 Images help document your activity. Upload clear photos of the activity or participants.
        </p>
      </div>
    </div>
  );
};

export default IssuesStep;
