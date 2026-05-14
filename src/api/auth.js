import api from '@/api/client';

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify registration OTP
export const verifyRegistrationOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-registration-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request new OTP
export const requestNewOTP = async (email) => {
  try {
    const response = await api.post('/auth/request-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify login OTP
export const verifyLoginOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-login-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
