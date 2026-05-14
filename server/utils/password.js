import bcryptjs from 'bcryptjs';

// Hash password
export const hashPassword = async (password) => {
  try {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcryptjs.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};
