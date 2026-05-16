import React from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ value = 0, onChange, size = 'md', readOnly = false, label }) => {
  const sizeClass =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  const handleClick = (star) => {
    if (readOnly || !onChange) return;
    onChange(star);
  };

  return (
    <div className="inline-flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      )}
      <div
        className="inline-flex items-center gap-0.5"
        role={readOnly ? 'img' : 'group'}
        aria-label={readOnly ? `Rating: ${value} out of 5` : 'Select rating'}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(star)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded`}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <FiStar
                className={`${sizeClass} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StarRating;
