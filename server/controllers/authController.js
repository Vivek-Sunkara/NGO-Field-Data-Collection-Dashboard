import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otp.js';
import { generateToken } from '../utils/jwt.js';
import { sendOTPEmail } from '../config/email.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login or use a different email',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to your email',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message,
    });
  }
};

// Verify OTP during registration
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one',
      });
    }

    // Check if OTP is correct
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// Request new OTP
export const requestNewOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting new OTP',
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Send OTP for verification
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      await sendOTPEmail(email, otp, user.name);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. OTP sent to your email',
        data: {
          userId: user._id,
          email: user.email,
          requiresOTPVerification: true,
        },
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate login OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send login OTP email
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for login verification',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        requiresOTPVerification: true,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Verify login OTP
export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again',
      });
    }

    // Check if OTP is correct
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// Logout (frontend handles token removal, but we can invalidate on backend if needed)
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message,
    });
  }
};
