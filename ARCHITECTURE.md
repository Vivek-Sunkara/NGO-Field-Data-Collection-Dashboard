# 📁 Complete Project File Structure

## Project Root Directory
```
NGO-Field-Data-Collection-Dashboard/
├── 📄 README.md                      # Project overview
├── 📄 SETUP_INSTRUCTIONS.md          # Detailed setup guide ⭐ START HERE
├── 📄 API_DOCUMENTATION.md           # API endpoint reference
├── 📄 IMPLEMENTATION_COMPLETE.md     # Complete implementation summary
├── 📄 QUICK_REFERENCE.md             # Quick commands and tips
├── 📄 ARCHITECTURE.md                # This file - file structure overview
│
├── 📦 package.json                   # Frontend dependencies
├── 🎨 tailwind.config.js             # Tailwind CSS configuration
├── 📝 postcss.config.js              # PostCSS configuration
├── ⚡ vite.config.js                 # Vite configuration
├── 📄 index.html                     # HTML entry point
├── 📄 .env.example                   # Environment template (frontend)
├── 📄 .gitignore                     # Git ignore rules
│
├── 📁 server/                        # BACKEND (Node.js + Express)
│   ├── 📦 package.json               # Backend dependencies
│   ├── 🔧 server.js                  # Express server entry point ⭐
│   ├── 📄 .env.example               # Environment template
│   ├── 📄 .gitignore                 # Git ignore rules
│   │
│   ├── 📁 config/                    # Configuration files
│   │   ├── database.js               # MongoDB connection setup
│   │   └── email.js                  # Nodemailer configuration ✉️
│   │
│   ├── 📁 models/                    # Database schemas
│   │   └── User.js                   # User schema (name, email, password, role, OTP)
│   │
│   ├── 📁 controllers/               # Business logic
│   │   └── authController.js         # Authentication controller (register, login, OTP verify)
│   │
│   ├── 📁 routes/                    # API endpoints
│   │   └── auth.js                   # Auth routes
│   │
│   ├── 📁 middleware/                # Express middleware
│   │   ├── auth.js                   # JWT verification & role-based access
│   │   └── errorHandler.js           # Global error handling
│   │
│   └── 📁 utils/                     # Utility functions
│       ├── jwt.js                    # JWT token generation/verification
│       ├── otp.js                    # OTP generation & expiry logic
│       └── password.js               # Password hashing with bcryptjs
│
├── 📁 src/                           # FRONTEND (React + Vite)
│   ├── 📄 main.jsx                   # React entry point ⭐
│   ├── 📄 App.jsx                    # Main App component with routing
│   ├── 🎨 index.css                  # Global styles + Tailwind imports
│   │
│   ├── 📁 api/                       # API integration layer
│   │   ├── client.js                 # Axios instance with interceptors
│   │   └── auth.js                   # Auth API calls (register, login, etc.)
│   │
│   ├── 📁 components/                # Reusable components
│   │   ├── Loading.jsx               # Loading spinner & LoadingButton
│   │   └── Toast.jsx                 # Toast notifications system
│   │
│   ├── 📁 context/                   # React Context (State Management)
│   │   └── AuthContext.jsx           # Global auth state provider
│   │
│   ├── 📁 hooks/                     # Custom React hooks
│   │   └── useAuth.js                # Hook to access auth context
│   │
│   ├── 📁 layouts/                   # Layout components
│   │   ├── Header.jsx                # Navigation header with user menu
│   │   ├── Footer.jsx                # Footer component
│   │   └── MainLayout.jsx            # Main layout wrapper
│   │
│   ├── 📁 pages/                     # Page components
│   │   │
│   │   ├── 📁 auth/                  # Authentication pages
│   │   │   ├── Login.jsx             # Login page with email & password
│   │   │   ├── Register.jsx          # Registration page with role selection
│   │   │   ├── VerifyRegistrationOTP.jsx  # OTP verification (registration)
│   │   │   └── VerifyLoginOTP.jsx    # OTP verification (login)
│   │   │
│   │   ├── 📁 admin/                 # Admin pages
│   │   │   └── AdminDashboard.jsx    # Admin dashboard (protected route)
│   │   │
│   │   ├── 📁 worker/                # Field Worker pages
│   │   │   └── FieldWorkerDashboard.jsx  # Worker dashboard (protected route)
│   │   │
│   │   ├── Unauthorized.jsx          # 403 Unauthorized page
│   │   └── NotFound.jsx              # 404 Not Found page
│   │
│   ├── 📁 routes/                    # Route components
│   │   └── ProtectedRoute.jsx        # Route guards (ProtectedRoute, RoleProtectedRoute)
│   │
│   └── 📁 utils/                     # Utility functions
│       ├── validation.js             # Form validation functions
│       └── toast.js                  # Toast notification utilities
```

---

## 🔗 Key File Relationships

### Authentication Flow (Backend)
```
User Request
    ↓
server.js (entry)
    ↓
Express App (app.use(authRoutes))
    ↓
routes/auth.js (route handler)
    ↓
controllers/authController.js (business logic)
    ↓
models/User.js (database)
    ↓
utils/ (jwt, otp, password)
    ↓
config/email.js (send OTP)
    ↓
Response to Client
```

### Authentication Flow (Frontend)
```
User Interaction
    ↓
pages/auth/*.jsx (form component)
    ↓
api/auth.js (API call)
    ↓
api/client.js (Axios instance)
    ↓
context/AuthContext.jsx (store token/user)
    ↓
localStorage (persist auth)
    ↓
routes/ProtectedRoute.jsx (route guard)
    ↓
Dashboard Display
```

---

## 📊 File Statistics

### Backend Files
| Category | Files | Lines of Code |
|----------|-------|---------------|
| Config | 2 | 100+ |
| Models | 1 | 80+ |
| Controllers | 1 | 400+ |
| Routes | 1 | 50+ |
| Middleware | 2 | 80+ |
| Utils | 3 | 150+ |
| **Total** | **10** | **860+** |

### Frontend Files
| Category | Files | Lines of Code |
|----------|-------|---------------|
| API | 2 | 150+ |
| Components | 2 | 200+ |
| Context & Hooks | 2 | 200+ |
| Layouts | 3 | 150+ |
| Pages (Auth) | 4 | 500+ |
| Pages (Dashboard) | 2 | 250+ |
| Pages (Error) | 2 | 100+ |
| Routes | 1 | 100+ |
| Utils | 2 | 150+ |
| Config/CSS | 4 | 100+ |
| **Total** | **24** | **1,800+** |

### Total Project
- **Total Files:** 38+
- **Total Lines of Code:** 2,660+
- **Backend:** ~860 LOC
- **Frontend:** ~1,800 LOC

---

## 🎯 File Access Patterns

### To Modify Colors/Styling
```
Edit: tailwind.config.js
  ↓ Affects all pages using Tailwind classes
```

### To Change API URL
```
Edit: .env (VITE_API_URL)
  ↓ Loaded by: src/api/client.js
```

### To Modify Login Flow
```
Edit: src/pages/auth/Login.jsx
  ↓ Calls: src/api/auth.js
  ↓ Uses: src/context/AuthContext.jsx
```

### To Add New API Endpoint
```
1. server/routes/auth.js (add route)
2. server/controllers/authController.js (add handler)
3. src/api/auth.js (add function)
4. Use in component
```

### To Add New Page
```
1. Create file in src/pages/
2. Import in src/App.jsx
3. Add route in <Routes>
4. Protect if needed with <ProtectedRoute>
```

---

## 🔐 Security-Critical Files

### Must Keep Secret ⚠️
```
.env (both frontend and backend)
- JWT_SECRET
- MONGO_URI (if includes password)
- EMAIL_PASS (Gmail app password)
```

### Never Commit These
```
node_modules/
.env
.env.local
dist/
build/
```

### Safe to Commit
```
.env.example (template only, no secrets)
All .js files
All .jsx files
All config files (except .env)
Documentation
```

---

## 🚀 Entry Points

### Backend Entry
- **File:** `server/server.js`
- **Command:** `npm run dev` (in server/)
- **Port:** 5000
- **Start:** `connectDB()` → `app.listen(PORT)`

### Frontend Entry
- **File:** `src/main.jsx`
- **Command:** `npm run dev`
- **Port:** 5173
- **Start:** `ReactDOM.createRoot()` → `App` component

---

## 📦 Dependencies

### Backend (package.json - server/)
```json
{
  "express": "^4.18.2",              // HTTP server
  "mongoose": "^7.5.0",              // MongoDB ODM
  "bcryptjs": "^2.4.3",              // Password hashing
  "jsonwebtoken": "^9.1.0",          // JWT tokens
  "nodemailer": "^6.9.7",            // Email service
  "dotenv": "^16.3.1",               // Environment variables
  "cors": "^2.8.5",                  // CORS support
  "express-validator": "^7.0.0"      // Input validation (optional)
}
```

### Frontend (package.json)
```json
{
  "react": "^18.2.0",                // UI framework
  "react-dom": "^18.2.0",            // React DOM
  "react-router-dom": "^6.20.0",     // Routing
  "axios": "^1.6.0",                 // HTTP client
  "tailwindcss": "^3.4.1",           // CSS framework
  "vite": "^5.0.8",                  // Build tool
  "@vitejs/plugin-react": "^4.2.1"   // Vite React plugin
}
```

---

## 🔄 Data Flow Examples

### Registration Complete Flow
```
Register.jsx (form)
  ↓ onSubmit
api/auth.js (registerUser)
  ↓ axios.post
server/routes/auth.js
  ↓ POST /register
server/controllers/authController.js (register function)
  ↓ validate input
  ↓ hash password (utils/password.js)
  ↓ save to DB (models/User.js)
  ↓ generate OTP (utils/otp.js)
  ↓ send email (config/email.js)
Response → VerifyRegistrationOTP.jsx
```

### Login Complete Flow
```
Login.jsx (form)
  ↓ onSubmit
api/auth.js (loginUser)
  ↓ axios.post
server/routes/auth.js
  ↓ POST /login
server/controllers/authController.js (login function)
  ↓ find user
  ↓ compare password (utils/password.js)
  ↓ generate OTP (utils/otp.js)
  ↓ send email (config/email.js)
Response → VerifyLoginOTP.jsx

User enters OTP:
  ↓
api/auth.js (verifyLoginOTP)
  ↓
server/controllers/authController.js (verifyLoginOTP)
  ↓ verify OTP
  ↓ generate JWT (utils/jwt.js)
AuthContext.jsx (store token, user)
  ↓
localStorage (persist)
  ↓
Redirect to Dashboard
```

---

## 🎨 Component Tree

```
App.jsx
├── Router
│   ├── AuthProvider
│   │   └── Routes
│   │       ├── /login → Login.jsx
│   │       ├── /register → Register.jsx
│   │       ├── /verify-registration-otp → VerifyRegistrationOTP.jsx
│   │       ├── /verify-login-otp → VerifyLoginOTP.jsx
│   │       ├── /admin/dashboard → (RoleProtectedRoute)
│   │       │   └── MainLayout
│   │       │       ├── Header.jsx
│   │       │       ├── AdminDashboard.jsx
│   │       │       └── Footer.jsx
│   │       ├── /worker/dashboard → (RoleProtectedRoute)
│   │       │   └── MainLayout
│   │       │       ├── Header.jsx
│   │       │       ├── FieldWorkerDashboard.jsx
│   │       │       └── Footer.jsx
│   │       ├── /unauthorized → Unauthorized.jsx
│   │       └── /* → NotFound.jsx
│   └── ToastContainer.jsx
```

---

## 🗂️ How to Navigate the Project

### For Beginners
1. **Start:** Read README.md
2. **Setup:** Follow SETUP_INSTRUCTIONS.md
3. **Reference:** Use QUICK_REFERENCE.md for commands
4. **Understand:** Read IMPLEMENTATION_COMPLETE.md

### For Backend Development
1. **Entry:** `server/server.js`
2. **Routes:** `server/routes/auth.js`
3. **Logic:** `server/controllers/authController.js`
4. **Database:** `server/models/User.js`
5. **Utils:** `server/utils/`

### For Frontend Development
1. **Entry:** `src/main.jsx` → `src/App.jsx`
2. **Auth Logic:** `src/context/AuthContext.jsx`
3. **Pages:** `src/pages/`
4. **Components:** `src/components/`
5. **Styling:** `tailwind.config.js`

### For API Integration
1. **Client:** `src/api/client.js`
2. **Services:** `src/api/auth.js`
3. **Context:** `src/context/AuthContext.jsx`
4. **Usage:** In any component with `useAuth()`

---

## 📝 File Modification Guide

### Modify Login UI
```
Edit: src/pages/auth/Login.jsx
Impact: Only login page styling
Restart: No restart needed (Vite auto-reload)
```

### Add New API Endpoint
```
1. server/routes/auth.js (add route)
2. server/controllers/authController.js (add handler)
3. src/api/auth.js (add function)
4. Restart backend
```

### Change Database Schema
```
Edit: server/models/User.js
Migration: Manual migration required
Restart: Backend restart needed
```

### Modify Error Messages
```
Frontend: Check src/pages/ files
Backend: Check server/controllers/
Both already have comprehensive messages
```

---

## ✨ Summary

### What Each Layer Does

**Backend (server/)**
- Handles authentication logic
- Validates user input
- Manages database
- Sends OTP emails
- Generates JWT tokens
- Protects API endpoints

**Frontend (src/)**
- Displays user interface
- Collects user input
- Calls backend APIs
- Manages authentication state
- Protects routes
- Shows notifications

**Database (MongoDB)**
- Stores user information
- Persists authentication data
- Indexed for performance

**Email Service (Nodemailer)**
- Sends OTP emails
- Professional templates
- Gmail integration

---

## 🎯 Quick File References

| Need | File | Location |
|------|------|----------|
| Register logic | authController.js | server/controllers |
| Login logic | authController.js | server/controllers |
| User schema | User.js | server/models |
| API routes | auth.js | server/routes |
| JWT functions | jwt.js | server/utils |
| OTP functions | otp.js | server/utils |
| Password hashing | password.js | server/utils |
| API client | client.js | src/api |
| Auth calls | auth.js | src/api |
| Auth state | AuthContext.jsx | src/context |
| Auth hook | useAuth.js | src/hooks |
| Login page | Login.jsx | src/pages/auth |
| Register page | Register.jsx | src/pages/auth |
| Admin dashboard | AdminDashboard.jsx | src/pages/admin |
| Worker dashboard | FieldWorkerDashboard.jsx | src/pages/worker |
| Route protection | ProtectedRoute.jsx | src/routes |

---

**File Structure Version:** 1.0  
**Last Updated:** May 14, 2024  
**Status:** Complete ✅
