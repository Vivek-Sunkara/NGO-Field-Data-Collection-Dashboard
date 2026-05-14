import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '@/useAuth';
import { isValidOTP } from '@/utils/validation';
import { showToast, formatErrorMessage, TOAST_TYPES } from '@/utils/toast';
import { LoadingButton } from '@/components/Loading';

const VerifyRegistrationOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyRegistrationOTP, requestNewOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const email = location.state?.email;
  const userId = location.state?.userId;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Start countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyRegistrationOTP(email, otp);

      if (response.success) {
        showToast(response.message, TOAST_TYPES.SUCCESS);
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      showToast(errorMessage, TOAST_TYPES.ERROR);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await requestNewOTP(email);

      if (response.success) {
        showToast(response.message, TOAST_TYPES.SUCCESS);
        setOtp('');
        setTimeLeft(300); // Reset timer
      }
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      showToast(errorMessage, TOAST_TYPES.ERROR);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">✉️</h1>
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit OTP to<br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleChange}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              OTP expires in: <span className="font-bold">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            disabled={loading || timeLeft === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </LoadingButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Didn't receive the OTP?</p>
          <LoadingButton
            onClick={handleResendOTP}
            loading={resendLoading}
            disabled={resendLoading || timeLeft > 30}
            className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
          >
            {resendLoading ? 'Resending...' : 'Resend OTP'}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default VerifyRegistrationOTP;
