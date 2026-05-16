import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '@/useAuth';
import { validateRegistrationForm } from '@/utils/validation';
import { showToast, formatErrorMessage, TOAST_TYPES } from '@/utils/toast';
import { LoadingButton } from '@/components/Loading';
import ThemeToggle from '@/components/ThemeToggle';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Field Worker',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);

      if (response.success) {
        showToast(response.message, TOAST_TYPES.SUCCESS);
        // Redirect to OTP verification
        navigate('/verify-registration-otp', {
          state: {
            email: formData.email,
            userId: response.data?.userId,
          },
        });
      }
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      showToast(errorMessage, TOAST_TYPES.ERROR);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100';

  return (
    <>
      <div className="fixed top-4 right-4 z-[100]">
        <ThemeToggle />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center px-4 py-8 transition-colors">
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg shadow-lg p-8 w-full max-w-md text-gray-900 dark:text-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">🏢</h1>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">NGO Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account</p>
          </div>

          {errors.submit && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`${inputBase} ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`${inputBase} ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${inputBase} border-gray-300 dark:border-gray-600`}
              >
                <option value="Admin">Admin</option>
                <option value="Field Worker">Field Worker</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputBase} ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputBase} ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </LoadingButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
