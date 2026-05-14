# API Documentation

## 🔗 Base URL
```
http://localhost:5000/api
```

## 📚 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your email",
  "data": {
    "userId": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "Admin"
  }
}
```

**Status Codes:**
- 201: User registered successfully
- 400: Validation error or user already exists
- 500: Server error

---

### 2. Verify Registration OTP
**POST** `/auth/verify-registration-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login",
  "data": {
    "userId": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "Admin"
  }
}
```

---

### 3. Request New OTP
**POST** `/auth/request-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "data": {
    "email": "john@example.com"
  }
}
```

---

### 4. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email for login verification",
  "data": {
    "userId": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "Admin",
    "requiresOTPVerification": true
  }
}
```

---

### 5. Verify Login OTP
**POST** `/auth/verify-login-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin",
      "isVerified": true
    }
  }
}
```

---

### 6. Get User Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "isVerified": true,
    "lastLogin": "2024-05-14T10:30:00Z",
    "createdAt": "2024-05-14T09:00:00Z"
  }
}
```

---

### 7. Logout User
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔒 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Structure
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6InVzZXJfaWQiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODk5MzE2NzMsImV4cCI6MTY5MDUzNjQ3M30.
signature
```

- **Header:** Algorithm and token type
- **Payload:** User ID, role, issued at, expiration
- **Signature:** Verified using JWT_SECRET

---

## 👥 User Roles

### Admin
- Can create data collection forms
- Can view all responses
- Can manage field workers
- Accessible at: `/admin/dashboard`

### Field Worker
- Can only fill assigned forms
- Can view their own submissions
- Cannot access admin features
- Accessible at: `/worker/dashboard`

---

## ⚠️ Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## 🔄 Authentication Flow

### Registration Flow
```
1. User Registration
   ↓
2. Generate & Send OTP
   ↓
3. Verify OTP
   ↓
4. User Verified ✓
   ↓
5. Ready for Login
```

### Login Flow
```
1. Email & Password
   ↓
2. Verify Credentials
   ↓
3. Generate & Send OTP
   ↓
4. Verify OTP
   ↓
5. Generate JWT Token ✓
   ↓
6. Redirect to Dashboard
```

---

## 💡 Usage Examples

### Example: Complete Registration & Login Flow

**Step 1: Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "Admin"
  }'
```

**Step 2: Check Email for OTP and Verify Registration**
```bash
curl -X POST http://localhost:5000/api/auth/verify-registration-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Step 3: Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Step 4: Verify Login OTP**
```bash
curl -X POST http://localhost:5000/api/auth/verify-login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "654321"
  }'
```

**Step 5: Access Protected Endpoint**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token_from_step_4>"
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ["Admin", "Field Worker"]),
  isVerified: Boolean (default: false),
  otp: String,
  otpExpiry: Date,
  lastLogin: Date,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Best Practices

1. **Store Token Securely:** Use httpOnly cookies or localStorage (current approach)
2. **Handle Expiration:** Refresh token before expiry or redirect to login
3. **Validate Input:** Always validate on both frontend and backend
4. **Use HTTPS:** In production, always use HTTPS
5. **Rate Limiting:** Implement rate limiting on login/registration endpoints
6. **Secure Password:** Passwords are hashed with bcryptjs (10 salt rounds)

---

## 📱 CORS Configuration

The API supports CORS requests from:
```
http://localhost:5173 (default for development)
```

Update `CORS_ORIGIN` in backend `.env` for other URLs.

---

**Documentation Version:** 1.0  
**Last Updated:** May 14, 2024
