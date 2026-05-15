import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_DIR = path.join(__dirname, '../../uploads/submissions');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Ensure upload directory exists
 */
export const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * Validate uploaded file
 */
export const validateUploadFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
  }

  if (file && !ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
  }

  if (file && file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate unique filename
 */
export const generateFileName = (originalFileName, workerId) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalFileName);
  return `submission_${workerId}_${timestamp}_${randomString}${ext}`;
};

/**
 * Save uploaded file
 */
export const saveUploadedFile = (file, workerId) => {
  ensureUploadDir();

  const validation = validateUploadFile(file);
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '));
  }

  const fileName = generateFileName(file.originalname, workerId);
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, file.buffer);

  return {
    fileName,
    fileSize: file.size,
    fileUrl: `/api/uploads/submissions/${fileName}`,
  };
};

/**
 * Delete uploaded file
 */
export const deleteUploadedFile = (fileName) => {
  const filePath = path.join(UPLOAD_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

/**
 * Get file path for serving
 */
export const getUploadFilePath = (fileName) => {
  return path.join(UPLOAD_DIR, fileName);
};
