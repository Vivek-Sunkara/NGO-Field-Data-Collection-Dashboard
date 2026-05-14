// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// OTP validation (6 digits)
export const isValidOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Validate registration form
export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name = 'Name must be at least 2 characters long';
  }

  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isValidPassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.role) {
    errors.role = 'Please select a role';
  }

  return errors;
};

// Validate login form
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return errors;
};
