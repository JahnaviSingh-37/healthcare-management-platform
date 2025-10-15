# 🚀 QUICK START GUIDE - Advanced Features

## ⚡ Get Your Advanced Features Running in 20 Minutes!

---

## 📋 What You Need

Before starting, make sure you have:
- ✅ Node.js and npm installed
- ✅ Python 3.8+ installed
- ✅ MongoDB running
- ✅ Gmail account (for OTP emails)
- ✅ Google Cloud Console access (for OAuth)

---

## 🎯 Step-by-Step Setup

### Step 1: Configure Email for OTP (5 minutes) ⏰

**1.1 Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Generate password
6. **Copy the 16-character code** (format: `xxxx xxxx xxxx xxxx`)

**1.2 Update Backend `.env`:**
```bash
cd /Users/jahnavisingh/healthcare/backend
nano .env  # or use your preferred editor
```

Add these lines:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your16charapppassword
EMAIL_FROM_NAME=Healthcare Platform
FRONTEND_URL=http://localhost:3001
```

**Save and exit!**

---

### Step 2: Configure Google OAuth (10 minutes) ⏰

**2.1 Create Google OAuth Credentials:**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project:**
   - Click "Select a project" → "New Project"
   - Name it: "Healthcare Platform"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "Healthcare OAuth"
   
5. **Add Authorized Redirect URI:**
   ```
   http://localhost:5001/api/v1/auth/google/callback
   ```
   
6. **Click "Create"**
   - Copy your **Client ID**
   - Copy your **Client Secret**

**2.2 Generate Session Secret:**
```bash
cd /Users/jahnavisingh/healthcare/backend
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Copy the output!**

**2.3 Update Backend `.env`:**
```bash
nano .env
```

Add these lines:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
SESSION_SECRET=paste-the-64-char-string-you-generated
```

**Save and exit!**

---

### Step 3: Start Flask Anomaly Detection (5 minutes) ⏰

**3.1 Setup Python Environment:**
```bash
cd /Users/jahnavisingh/healthcare/anomaly-detection
python3 -m venv venv
source venv/bin/activate
```

**3.2 Install Dependencies:**
```bash
pip install -r requirements.txt
```

**3.3 Start Flask Service:**
```bash
python app.py
```

**✅ You should see:**
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!**

---

### Step 4: Start All Services (2 minutes) ⏰

**4.1 Terminal 1 - Backend:**
```bash
cd /Users/jahnavisingh/healthcare/backend
npm run dev
```
**✅ Should see:** `Server running on port 5001`

**4.2 Terminal 2 - Frontend:**
```bash
cd /Users/jahnavisingh/healthcare/frontend
npm start
```
**✅ Should see:** `Compiled successfully! Open http://localhost:3001`

**4.3 Terminal 3 - Flask (Already running from Step 3)**
```bash
# Keep this running!
```

---

## 🧪 Test Each Feature (5 minutes)

### Test 1: OTP Verification ✅

1. **Open:** http://localhost:3001/register
2. **Fill in the form:**
   - Name: Test User
   - Email: your-email@gmail.com
   - Password: Test@123456
   - Confirm Password: Test@123456
   - Role: Patient

3. **Click "Register"**
4. **Check your email** for OTP code (6 digits)
5. **Enter OTP** in the verification screen
6. **Success!** You should be logged in and redirected to dashboard

**✨ OTP Feature Working!**

---

### Test 2: Dark Mode ✅

1. **After logging in**, look at the top navigation bar
2. **Find the sun/moon icon** (next to your avatar)
3. **Click it** - theme should switch instantly!
4. **Refresh the page** - theme should persist!

**✨ Dark Mode Working!**

---

### Test 3: Google OAuth ✅

1. **Log out** if logged in
2. **Go to:** http://localhost:3001/login
3. **Click** "Sign in with Google" button
4. **Select your Google account**
5. **Authorize** the application
6. **Success!** Redirected to dashboard

**✨ OAuth Working!**

---

### Test 4: Flask Anomaly Detection ✅

**Test with curl:**
```bash
# Test Flask is running
curl http://localhost:5000/

# Train the model
curl -X POST http://localhost:5000/train \
  -H "Content-Type: application/json" \
  -d '{
    "access_logs": [
      {"timestamp": "2025-10-10T10:00:00Z", "user_id": "user1", "ip_address": "192.168.1.1"},
      {"timestamp": "2025-10-10T11:00:00Z", "user_id": "user1", "ip_address": "192.168.1.1"},
      {"timestamp": "2025-10-10T12:00:00Z", "user_id": "user1", "ip_address": "192.168.1.1"}
    ]
  }'

# Detect anomaly (unusual time + different IP)
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "access_log": {
      "timestamp": "2025-10-10T03:00:00Z",
      "user_id": "user1",
      "ip_address": "10.0.0.1"
    },
    "user_history": [
      {"timestamp": "2025-10-10T10:00:00Z", "ip_address": "192.168.1.1"}
    ]
  }'
```

**✅ You should see anomaly score!**

**✨ Flask ML Service Working!**

---

## 🎉 SUCCESS! All Features Running!

### What's Working:

| Feature | Status | How to Access |
|---------|--------|---------------|
| **OTP Verification** | ✅ Working | Register → Check email → Enter OTP |
| **Dark Mode** | ✅ Working | Click sun/moon icon in navbar |
| **Google OAuth** | ✅ Working | Login → "Sign in with Google" |
| **Flask ML** | ✅ Working | http://localhost:5000 |
| **Email Alerts** | ✅ Working | Configured with OTP system |

---

## 🔍 Troubleshooting

### Problem: OTP Email Not Received

**Solution:**
1. Check spam folder
2. Verify SMTP_EMAIL and SMTP_PASSWORD in `.env`
3. Ensure Gmail 2-Step Verification is enabled
4. Check backend logs for errors:
   ```bash
   cd backend && npm run dev
   # Look for "OTP sent successfully" or errors
   ```

---

### Problem: OAuth Redirect Fails

**Solution:**
1. Verify callback URL matches exactly:
   ```
   http://localhost:5001/api/v1/auth/google/callback
   ```
2. Check Google Console → Credentials → Authorized redirect URIs
3. Clear browser cookies
4. Ensure SESSION_SECRET is set in `.env`
5. Restart backend server

---

### Problem: Dark Mode Not Persisting

**Solution:**
1. Check browser console for errors
2. Verify localStorage is enabled
3. Clear browser cache
4. Check Redux DevTools (if installed)

---

### Problem: Flask Won't Start

**Solution:**
```bash
# Check Python version (need 3.8+)
python3 --version

# Try installing dependencies again
cd anomaly-detection
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Check if port 5000 is in use
lsof -i :5000
# If something is using it, kill the process or change port
```

---

## 📚 Next Steps

### 1. **Read the Documentation:**
   - `ADVANCED_FEATURES_SETUP.md` - Complete setup guide
   - `FEATURES_SUMMARY.md` - Feature overview
   - `ARCHITECTURE_DIAGRAM.md` - System architecture
   - `ENV_VARIABLES_GUIDE.md` - Environment variables

### 2. **Customize the Application:**
   - Update email templates in `/backend/src/config/email.js`
   - Modify theme colors in `/frontend/src/theme/themes.js`
   - Adjust ML model parameters in `/anomaly-detection/app.py`

### 3. **Deploy to Production:**
   - Set up HTTPS with SSL certificates
   - Use production email service (SendGrid, AWS SES)
   - Deploy Flask to Docker/Kubernetes
   - Configure production OAuth callbacks
   - Use environment-specific `.env` files

---

## 🎯 Quick Reference

### Service URLs:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5001/api/v1
- **Flask ML:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

### Key Files:
- **Backend Config:** `/backend/.env`
- **Frontend Config:** `/frontend/.env`
- **Flask Config:** `/anomaly-detection/.env` (create if needed)

### Important Commands:
```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check running services
lsof -i :3001 -i :5001 -i :5000

# View MongoDB data
mongosh
use healthcareDB
db.users.find()
db.otps.find()
```

---

## 🎊 Congratulations!

You now have a **fully functional healthcare platform** with:

✅ Multi-factor authentication (OTP)  
✅ Social login (Google OAuth)  
✅ Professional dark mode  
✅ AI-powered security monitoring  
✅ Real-time email alerts  
✅ Enterprise-grade architecture  

**Total Setup Time:** ~20 minutes  
**Features Added:** 5 major features  
**Files Created:** 15+ new files  
**Ready for:** Development & Testing  

---

## 📞 Need Help?

1. **Check logs** in terminal windows
2. **Review documentation** files
3. **Verify environment variables**
4. **Test each service** individually
5. **Check browser console** for errors

---

**🚀 Happy Coding!**

---

**Version:** 2.0.0  
**Last Updated:** October 10, 2025  
**Status:** ✅ All Features Working!
