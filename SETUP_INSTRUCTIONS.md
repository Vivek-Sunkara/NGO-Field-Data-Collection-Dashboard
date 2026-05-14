# NGO Field Data Collection Dashboard - Setup Instructions

## 📋 Project Overview

This is a complete MERN stack application for NGO field data collection with two-step email OTP verification, role-based access control, and secure authentication.

### Technology Stack

**Frontend:**
- React 18 + Vite
- React Router DOM for routing
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Nodemailer for email OTP
- dotenv for environment variables

---

## 🚀 Installation & Setup

### Prerequisites

Make sure you have installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- A Gmail account (for email OTP)

### Step 1: Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` file with your values:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/ngo-dashboard
   JWT_SECRET=your_super_secret_jwt_key_change_this
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # If using MongoDB Atlas, just ensure your MONGO_URI is correct
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`

### Step 2: Frontend Setup

1. **In a new terminal, navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` file:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

---

## 🔐 Gmail Configuration for OTP Email

### Getting Gmail App Password

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Turn on 2-Step Verification

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Generate a 16-character password
   - Copy and paste this as `EMAIL_PASS` in `.env`

3. **Your Email:** Use as `EMAIL_USER` in `.env`

---

## 📊 Testing the Application

### Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### Test User Accounts

#### Admin Account
- Email: `admin@example.com`
- Password: `password123`
- Role: Admin

#### Field Worker Account
- Email: `worker@example.com`
- Password: `password123`
- Role: Field Worker

### Testing Flow

1. **Registration:**
   - Go to http://localhost:5173/register
   - Fill in the form with desired credentials
   - Select role (Admin or Field Worker)
   - Submit
   - Check email for 6-digit OTP
   - Enter OTP on verification page
   - After verification, you can login

2. **Login:**
   - Go to http://localhost:5173/login
   - Enter email and password
   - OTP will be sent to your email
   - Enter 6-digit OTP for two-step verification
   - Get redirected to appropriate dashboard based on role

3. **Admin Dashboard:**
   - Accessible at http://localhost:5173/admin/dashboard
   - Shows dashboard metrics and quick actions
   - Field Workers cannot access this

4. **Field Worker Dashboard:**
   - Accessible at http://localhost:5173/worker/dashboard
   - Shows assigned forms and completion status
   - Admins cannot access this (redirected to /unauthorized)

5. **Logout:**
   - Click menu icon in header
   - Select Logout
   - Redirected to login page

---

## 📁 Project Structure

### Backend (`/server`)
```
server/
├── config/
│   ├── database.js          # MongoDB connection
│   └── email.js             # Nodemailer configuration
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js              # JWT and role validation
│   └── errorHandler.js      # Error handling
├── models/
│   └── User.js              # User schema
├── routes/
│   └── auth.js              # Auth endpoints
├── utils/
│   ├── jwt.js               # JWT utilities
│   ├── otp.js               # OTP generation
│   └── password.js          # Password hashing
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── server.js                # Entry point
```

### Frontend (`/src`)
```
src/
├── api/
│   ├── client.js            # Axios instance
│   └── auth.js              # Auth API calls
├── components/
│   ├── Loading.jsx          # Loading spinners
│   └── Toast.jsx            # Toast notifications
├── context/
│   └── AuthContext.jsx      # Auth context provider
├── hooks/
│   └── useAuth.js           # Auth hook
├── layouts/
│   ├── Header.jsx           # Header component
│   ├── Footer.jsx           # Footer component
│   └── MainLayout.jsx       # Main layout wrapper
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── VerifyRegistrationOTP.jsx
│   │   └── VerifyLoginOTP.jsx
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   ├── worker/
│   │   └── FieldWorkerDashboard.jsx
│   ├── Unauthorized.jsx
│   └── NotFound.jsx
├── routes/
│   └── ProtectedRoute.jsx   # Route guards
├── utils/
│   ├── validation.js        # Form validation
│   └── toast.js             # Toast utilities
├── App.jsx                  # Main app component
├── index.css                # Tailwind styles
└── main.jsx                 # Entry point
```

---

## 🔑 Key API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/verify-registration-otp` - Verify registration OTP
- **POST** `/api/auth/request-otp` - Request new OTP
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/verify-login-otp` - Verify login OTP
- **GET** `/api/auth/profile` - Get user profile (protected)
- **POST** `/api/auth/logout` - Logout user (protected)

---

## 🐛 Common Errors & Fixes

### Error: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- For MongoDB Atlas, verify connection string includes password

### Error: "Email not sending"
**Solution:**
- Verify Gmail app password is correct
- Ensure "Less secure app access" is enabled if not using app passwords
- Check that SMTP is enabled for your Gmail account

### Error: "CORS error"
**Solution:**
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:5173`
- Restart backend after changing

### Error: "OTP expired"
**Solution:**
- OTP expires after 5 minutes
- Click "Resend OTP" to get a new one
- Verify your system time is correct

### Error: "Invalid JWT token"
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Login again
- Ensure `JWT_SECRET` is same in `.env`

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Change JWT_SECRET** - Use a strong random string in production
3. **Use HTTPS** - In production, always use HTTPS
4. **Validate all inputs** - Backend validates all user inputs
5. **Secure password storage** - Passwords are hashed with bcryptjs
6. **Token expiration** - JWT tokens expire in 7 days
7. **OTP expiration** - OTPs expire in 5 minutes

---

## 📱 Mobile Responsiveness

The application is fully mobile-responsive using Tailwind CSS:
- Mobile-first design
- Responsive grids and layouts
- Touch-friendly buttons and forms
- Optimized for phones, tablets, and desktops

---

## 🚀 Deployment

### Heroku Deployment

**Backend:**
```bash
cd server
heroku create your-ngo-backend
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASS=your_password
git push heroku main
```

**Frontend (Vercel):**
```bash
npm run build
# Deploy dist folder to Vercel
```

---

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGO_URI | MongoDB connection | mongodb://localhost:27017/ngo-dashboard |
| JWT_SECRET | Secret key for JWT | your-secret-key |
| EMAIL_USER | Gmail address | your@gmail.com |
| EMAIL_PASS | Gmail app password | xxxx xxxx xxxx xxxx |
| CORS_ORIGIN | Frontend URL | http://localhost:5173 |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

---

## 📞 Support

For issues or questions:
1. Check the "Common Errors & Fixes" section
2. Verify environment variables are correct
3. Check browser console for errors
4. Check server logs for backend errors

---

## 📄 License

This project is part of the NGO Field Data Collection system.

---

## 🎯 Next Steps

After setup, you can:
1. Add form creation functionality for admins
2. Implement form submission for field workers
3. Add data visualization and reports
4. Implement user management
5. Add file upload capabilities
6. Implement data export features

---

**Happy coding! 🚀**
