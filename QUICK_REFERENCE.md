# 🎯 Quick Reference Guide

## 🚀 Get Started in 5 Minutes

### Terminal 1: Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with Gmail credentials, MongoDB URI, JWT secret
npm run dev
```

### Terminal 2: Frontend
```bash
npm install
cp .env.example .env
npm run dev
```

**Visit:** http://localhost:5173

---

## 📝 Essential Commands

### Backend Commands
```bash
cd server

npm install              # Install dependencies
npm run dev             # Development mode (with auto-reload)
npm start               # Production mode
npm test                # Run tests (when available)
```

### Frontend Commands
```bash
npm install              # Install dependencies
npm run dev             # Development server
npm run build           # Production build
npm run preview         # Preview production build
```

---

## 🔐 Configuration Checklist

### Backend .env
```env
✓ PORT=5000
✓ NODE_ENV=development
✓ MONGO_URI=mongodb://localhost:27017/ngo-dashboard
✓ JWT_SECRET=your-strong-secret-here
✓ EMAIL_USER=your-gmail@gmail.com
✓ EMAIL_PASS=xxxx-xxxx-xxxx-xxxx (App Password)
✓ CORS_ORIGIN=http://localhost:5173
```

### Frontend .env
```env
✓ VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Quick Test Scenarios

### Scenario 1: Complete Registration
1. Go to http://localhost:5173/register
2. Fill: Name, Email, Password (6+ chars), Role
3. Check terminal logs for OTP
4. Enter OTP on verification page
5. ✓ Registration complete

### Scenario 2: Login with OTP
1. Go to http://localhost:5173/login
2. Enter email and password
3. Check terminal logs for OTP
4. Enter OTP
5. ✓ Logged in → Dashboard

### Scenario 3: Role Access
1. **As Admin:** Can access `/admin/dashboard`
2. **As Worker:** Can access `/worker/dashboard`
3. **Wrong role:** → Redirected to `/unauthorized`

---

## 🐛 Debugging Tips

### Check Server Logs
```bash
# Terminal running backend (npm run dev)
- Look for "OTP:" followed by 6 digits
- Look for connection messages
- Look for errors in red text
```

### Check Browser Console
```bash
# Press F12 in browser
- Console tab for JavaScript errors
- Network tab for API calls
- Application tab for localStorage
```

### Test API Endpoints
```bash
# Check if backend is responding
curl http://localhost:5000/api/health

# Should return: {"success":true,"message":"API is running"}
```

### Clear Browser Data
```javascript
// Open Console (F12) and run:
localStorage.clear()
sessionStorage.clear()
// Refresh page
```

---

## 🔑 Important Passwords & Keys

### Test Users (After Registration)
- Email: Your registered email
- Password: Your registered password

### Gmail Setup
- **Get App Password:** https://myaccount.google.com/apppasswords
- **Enable 2FA:** https://myaccount.google.com/security
- **Use App Password** (not Gmail password)

### JWT Secret
```bash
# Generate random secret (macOS/Linux)
openssl rand -base64 32

# Generate random secret (Windows)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([guid]::NewGuid()))
```

---

## 📱 Browser Testing

### URLs to Test
| URL | Expected |
|-----|----------|
| http://localhost:5173 | Redirect to /login |
| http://localhost:5173/login | Login page |
| http://localhost:5173/register | Register page |
| http://localhost:5173/admin/dashboard | Admin dashboard (protected) |
| http://localhost:5173/worker/dashboard | Worker dashboard (protected) |
| http://localhost:5173/unauthorized | Access denied page |
| http://localhost:5173/not-found | 404 page |

### Test Response Times
- Registration: < 2s
- OTP Verification: < 1s
- Login: < 3s (includes email)
- Dashboard Load: < 1s

---

## 🚨 Quick Fixes

### "Cannot connect to MongoDB"
```bash
# Start MongoDB
mongod

# OR use MongoDB Atlas
# Update MONGO_URI in .env
```

### "Email not sending"
```bash
1. Use Gmail App Password (not Gmail password)
2. Check EMAIL_USER and EMAIL_PASS in .env
3. Check .env is not in .gitignore
```

### "CORS error"
```bash
# In backend .env, set:
CORS_ORIGIN=http://localhost:5173

# Restart backend after changes
```

### "OTP Expired"
```bash
1. Click "Resend OTP"
2. New OTP valid for 5 minutes
3. Check terminal logs if not received
```

### "Cannot send OTP email"
```bash
1. Verify Gmail credentials are correct
2. Enable 2-Step Verification on Gmail account
3. Generate new App Password from Google Account
4. Update EMAIL_PASS in .env
5. Restart backend
```

---

## 🗂️ Important File Locations

### Backend
```
server/
├── .env                    # Configuration (don't commit)
├── .env.example           # Template (safe to commit)
├── server.js              # Entry point
└── package.json           # Dependencies
```

### Frontend
```
src/
├── App.jsx                # Main component
├── main.jsx               # Entry point
├── index.css              # Tailwind styles
└── context/AuthContext.jsx # Auth state
```

### Configuration
```
Root/
├── .env.example           # Frontend env template
├── .env                   # Frontend env (local)
├── package.json           # Frontend dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind configuration
```

---

## 📊 Development Workflow

### Daily Development Steps
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: MongoDB (if local)
mongod

# Access:
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

### Code Changes
- **Frontend:** Vite auto-reloads on save
- **Backend:** Nodemon auto-restarts on save
- **No manual refresh needed** (usually)

---

## 🔍 Monitoring & Logs

### Backend Logs Look For:
```
✓ "Server is running on port 5000"
✓ "MongoDB Connected: localhost"
✓ "OTP email sent to john@example.com"
✓ "OTP: 123456" (6-digit code)
```

### Frontend Console (F12):
```javascript
// Check localStorage
localStorage.getItem('authToken')
localStorage.getItem('user')

// Check errors
console.log('errors here')
```

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Change API URL
Edit `.env`:
```env
VITE_API_URL=http://your-api-url/api
```

### Change Email Template
Edit `server/config/email.js`:
```javascript
html: `<div>Your custom HTML here</div>`
```

---

## 📈 Performance Tips

### Frontend
- Dev build: Fast (used with `npm run dev`)
- Production build: `npm run build`
- Minified CSS and JS
- Image optimization

### Backend
- Database indexing on email: `✓` (done)
- JWT caching: Can be added
- Request compression: Can be added

### Optimization Ideas
- Add rate limiting on auth endpoints
- Implement refresh tokens
- Add API response caching
- Optimize image loading

---

## 🚀 Deployment Quick Checklist

### Before Deploying
```
✓ Update JWT_SECRET
✓ Set NODE_ENV=production
✓ Update MONGO_URI (use Atlas)
✓ Update CORS_ORIGIN
✓ Test locally first
✓ npm run build (frontend)
✓ Run `npm install` (dependencies)
✓ Set all environment variables
```

### Deployment Commands
```bash
# Heroku (backend)
heroku create app-name
heroku config:set MONGO_URI=<uri>
git push heroku main

# Vercel (frontend)
vercel --prod
```

---

## 📞 Need Help?

### Check These First:
1. SETUP_INSTRUCTIONS.md - Detailed setup
2. API_DOCUMENTATION.md - API reference
3. IMPLEMENTATION_COMPLETE.md - Full overview
4. Browser console (F12) - JavaScript errors
5. Terminal logs - Backend errors

### Common Commands to Debug:
```bash
# Check if servers running
curl http://localhost:5000/api/health
curl http://localhost:5173

# Kill a port (if stuck)
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## ✨ You're All Set!

```
🎉 Everything is ready to go!

1. Start backend:    npm run dev (in server/)
2. Start frontend:   npm run dev
3. Visit:            http://localhost:5173
4. Register/Login:   Test the flow!
5. Explore:          Try both dashboards!

Happy developing! 🚀
```

---

**Quick Reference Version:** 1.0  
**Last Updated:** May 14, 2024
