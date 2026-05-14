# NGO Field Data Collection Dashboard

A complete MERN stack application for NGO field data collection with email-based two-step verification (OTP), role-based access control, and secure authentication.

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ User Registration with email verification
- ✅ Email-based Two-Step OTP Verification
- ✅ Secure Login with JWT tokens
- ✅ Role-based Access Control (Admin, Field Worker)
- ✅ Protected Routes and Endpoints
- ✅ Persistent Login with localStorage
- ✅ Logout Functionality

### 👥 User Roles
- **Admin:** Create forms, view all responses, manage field workers
- **Field Worker:** Fill assigned forms, view own submissions

### 🎨 UI/UX
- Modern, clean interface with Tailwind CSS
- Fully responsive design (mobile, tablet, desktop)
- Loading states and animations
- Toast notifications for user feedback
- Professional NGO dashboard appearance
- Form validation with error messages

### 🔒 Security
- Password hashing with bcryptjs
- JWT token-based authentication
- OTP expiration (5 minutes)
- Input validation on frontend and backend
- Protected API endpoints
- Environment variables for sensitive data
- CORS configuration

### 📧 Email Features
- Professional OTP email templates
- Automated email verification
- Resendable OTP functionality
- Gmail integration via Nodemailer

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend
- **Node.js & Express** - Server
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **dotenv** - Environment variables

## 📦 Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Gmail account (for OTP emails)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NGO-Field-Data-Collection-Dashboard
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```

Visit `http://localhost:5173` in your browser.

For detailed setup instructions, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

## 🚀 Quick Start Commands

### Backend
```bash
cd server
npm install
npm run dev           # Development mode with nodemon
npm start             # Production mode
```

### Frontend
```bash
npm install
npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview production build
```

## 📚 Documentation

- [Setup Instructions](./SETUP_INSTRUCTIONS.md) - Detailed setup guide with Gmail configuration
- [API Documentation](./API_DOCUMENTATION.md) - Complete API endpoint reference
- [Project Structure](#-project-structure) - Folder and file organization

## 📁 Project Structure

```
NGO-Field-Data-Collection-Dashboard/
├── server/                          # Backend (Node.js + Express)
│   ├── config/
│   │   ├── database.js
│   │   └── email.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── otp.js
│   │   └── password.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── src/                             # Frontend (React + Vite)
│   ├── api/
│   │   ├── client.js
│   │   └── auth.js
│   ├── components/
│   │   ├── Loading.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── layouts/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── MainLayout.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyRegistrationOTP.jsx
│   │   │   └── VerifyLoginOTP.jsx
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── worker/
│   │   │   └── FieldWorkerDashboard.jsx
│   │   ├── Unauthorized.jsx
│   │   └── NotFound.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── utils/
│   │   ├── validation.js
│   │   └── toast.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── SETUP_INSTRUCTIONS.md
├── API_DOCUMENTATION.md
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ngo-dashboard
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📋 API Endpoints

### Auth Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-registration-otp` - Verify registration OTP
- `POST /api/auth/request-otp` - Request new OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-login-otp` - Verify login OTP
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - User logout (protected)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

### Test Accounts After Registration

1. **Register new account**
   - Visit http://localhost:5173/register
   - Fill form and submit
   - Check email for OTP (in test environment, check server logs)

2. **Login with OTP**
   - Visit http://localhost:5173/login
   - Enter credentials
   - Verify OTP sent to email
   - Get redirected to dashboard based on role

3. **Test Role-Based Access**
   - Admin: Access http://localhost:5173/admin/dashboard
   - Field Worker: Access http://localhost:5173/worker/dashboard
   - Try accessing wrong role's dashboard (redirected to /unauthorized)

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env
- For Atlas, verify IP whitelist

**Email not Sending**
- Verify Gmail credentials
- Ensure "Less secure apps" is allowed
- Use Gmail app password instead of regular password

**CORS Error**
- Check CORS_ORIGIN matches frontend URL
- Default: http://localhost:5173

**OTP Expired**
- OTP valid for 5 minutes
- Click "Resend OTP"

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md#-common-errors--fixes) for more solutions.

## 🚀 Deployment

### Deploying Backend (Heroku)
```bash
cd server
heroku create your-app-name
heroku config:set MONGO_URI=<your_mongodb_uri>
heroku config:set JWT_SECRET=<strong_secret>
git push heroku main
```

### Deploying Frontend (Vercel)
```bash
npm run build
vercel --prod
```

## 📄 License

This project is part of NGO Field Data Collection system. All rights reserved.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions:
1. Check [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check server logs for backend errors
4. Check browser console for frontend errors

## 🎯 Future Enhancements

- [ ] Form creation and management
- [ ] Data visualization and reports
- [ ] User management dashboard
- [ ] File upload functionality
- [ ] Data export to CSV/PDF
- [ ] Real-time form collaboration
- [ ] Mobile app version
- [ ] Offline data collection
- [ ] Advanced analytics
- [ ] Multi-language support

## 📝 Changelog

### Version 1.0 (Current)
- ✅ Complete authentication system
- ✅ Email OTP verification
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Admin & Field Worker dashboards
- ✅ Responsive UI with Tailwind CSS
- ✅ Complete API documentation

---

**Built with ❤️ for NGO Field Data Collection**

**Last Updated:** May 14, 2024
