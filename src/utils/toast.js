// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Create a simple toast notification
export const showToast = (message, type = TOAST_TYPES.INFO) => {
  // This will be handled by a Toast component that subscribes to a toast context
  // For now, we'll dispatch a custom event
  const event = new CustomEvent('showToast', {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};

// Format error message
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
