import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as authAPI from '@/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Register user
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.registerUser(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify registration OTP
  const verifyRegistrationOTP = useCallback(async (email, otp) => {
    setLoading(true);
    try {
      const response = await authAPI.verifyRegistrationOTP(email, otp);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request new OTP
  const requestNewOTP = useCallback(async (email) => {
    setLoading(true);
    try {
      const response = await authAPI.requestNewOTP(email);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.loginUser(email, password);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify login OTP and set auth state
  const verifyLoginOTP = useCallback(async (email, otp) => {
    setLoading(true);
    try {
      const response = await authAPI.verifyLoginOTP(email, otp);

      if (response.success && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authAPI.logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    verifyRegistrationOTP,
    requestNewOTP,
    login,
    verifyLoginOTP,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
