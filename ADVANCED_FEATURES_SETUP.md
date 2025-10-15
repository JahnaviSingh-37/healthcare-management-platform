# Advanced Features Setup Guide

This guide covers the setup and configuration of advanced security features including OTP verification, OAuth authentication, dark mode, and AI-powered anomaly detection.

## 🔐 Features Overview

### 1. **OTP Verification (Multi-Factor Authentication)**
- 6-digit OTP codes sent via email
- 10-minute expiration time
- 3 attempt limit per OTP
- Automatic cleanup of expired OTPs

### 2. **OAuth Google Sign-In**
- Secure Google authentication
- Automatic user creation for new OAuth users
- No password required for OAuth accounts

### 3. **Dark Mode**
- Toggle between light and dark themes
- Persistent theme selection (localStorage)
- Material-UI theme integration

### 4. **AI Anomaly Detection**
- Flask microservice with Isolation Forest ML algorithm
- Detects suspicious access patterns
- Real-time security monitoring

### 5. **Email Alerts**
- Security alerts for suspicious activities
- OTP delivery system
- Configurable SMTP settings

---

## 📋 Prerequisites

- Node.js v16+ and npm
- Python 3.8+ and pip
- MongoDB running
- Gmail account (for email features)
- Google Cloud Console project (for OAuth)

---

## ⚙️ Configuration

### 1. Email Configuration (OTP & Alerts)

#### Update Backend `.env`:
```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3001
```

#### Generate Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `SMTP_PASSWORD`

---

### 2. Google OAuth Setup

#### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   http://localhost:5001/api/v1/auth/google/callback
   ```
7. Copy the **Client ID** and **Client Secret**

#### Step 2: Update Backend `.env`:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback

# Session Secret (generate random string)
SESSION_SECRET=generate-a-very-long-random-secret-min-32-characters

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

#### Generate Session Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Flask Anomaly Detection Setup

#### Step 1: Navigate to anomaly-detection folder:
```bash
cd /Users/jahnavisingh/healthcare/anomaly-detection
```

#### Step 2: Create Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

#### Step 3: Install dependencies:
```bash
pip install -r requirements.txt
```

#### Step 4: Create `.env` file:
```env
FLASK_ENV=development
FLASK_PORT=5000
BACKEND_URL=http://localhost:5001
```

#### Step 5: Start Flask service:
```bash
python app.py
```

The Flask API will run on `http://localhost:5000`

---

### 4. Update Backend to Use Flask Service

Add to backend `.env`:
```env
# Anomaly Detection Service
ANOMALY_DETECTION_URL=http://localhost:5000
```

---

## 🚀 Running the Complete Application

### Terminal 1: Start MongoDB
```bash
mongod --dbpath /path/to/your/data/db
```

### Terminal 2: Start Flask Anomaly Detection
```bash
cd /Users/jahnavisingh/healthcare/anomaly-detection
source venv/bin/activate
python app.py
```

### Terminal 3: Start Backend
```bash
cd /Users/jahnavisingh/healthcare/backend
npm run dev
```

### Terminal 4: Start Frontend
```bash
cd /Users/jahnavisingh/healthcare/frontend
npm start
```

---

## 📱 Usage Guide

### OTP Verification Flow

1. **Registration**:
   - User fills registration form
   - Submits form
   - System sends OTP to email
   - User enters 6-digit OTP
   - Upon verification, user is logged in

2. **Resend OTP**:
   - Click "Resend OTP" link
   - Wait 60 seconds before next resend
   - Check email for new OTP

### Google OAuth Flow

1. **Login Page**:
   - Click "Sign in with Google" button
   - Redirected to Google sign-in
   - Authorize the application
   - Automatically logged in and redirected to dashboard

2. **First-Time OAuth Users**:
   - Account automatically created
   - Default role: Patient
   - No password required

### Dark Mode

1. **Toggle Theme**:
   - Click sun/moon icon in top navigation bar
   - Theme preference saved in localStorage
   - Persists across sessions

### Anomaly Detection

1. **Training Model**:
```bash
curl -X POST http://localhost:5000/train \
  -H "Content-Type: application/json" \
  -d '{
    "access_logs": [
      {"timestamp": "2025-01-01T10:00:00Z", "user_id": "user1", "ip_address": "192.168.1.1"},
      {"timestamp": "2025-01-01T11:00:00Z", "user_id": "user1", "ip_address": "192.168.1.1"}
    ]
  }'
```

2. **Detecting Anomalies**:
```bash
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "access_log": {
      "timestamp": "2025-01-01T03:00:00Z",
      "user_id": "user1",
      "ip_address": "10.0.0.1"
    },
    "user_history": [
      {"timestamp": "2025-01-01T10:00:00Z", "ip_address": "192.168.1.1"}
    ]
  }'
```

---

## 🧪 Testing

### Test Email (OTP):
```bash
# Register a new user
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test-email@gmail.com",
    "password": "Test@123456",
    "confirmPassword": "Test@123456",
    "role": "patient"
  }'

# Check your email for OTP
# Verify OTP
curl -X POST http://localhost:5001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "otp": "123456",
    "purpose": "registration"
  }'
```

### Test Google OAuth:
1. Open browser: `http://localhost:3001/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to dashboard

### Test Dark Mode:
1. Login to application
2. Click theme toggle icon (sun/moon) in navbar
3. Verify theme switches between light/dark
4. Refresh page - theme should persist

---

## 🔧 Troubleshooting

### Email Not Sending
- Verify Gmail app password is correct
- Check SMTP settings in `.env`
- Ensure 2-Step Verification is enabled
- Check spam folder for emails

### OAuth Not Working
- Verify Google Client ID and Secret
- Check authorized redirect URIs in Google Console
- Ensure callback URL matches exactly
- Check browser console for errors

### Flask Service Connection Failed
- Verify Flask is running on port 5000
- Check `ANOMALY_DETECTION_URL` in backend `.env`
- Ensure no firewall blocking
- Check Flask logs for errors

### Dark Mode Not Persisting
- Check browser localStorage is enabled
- Clear browser cache
- Verify Redux store includes themeSlice

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
# View logs in terminal where backend is running
# Logs include: user actions, OTP sends, OAuth logins, errors
```

### Flask Logs
```bash
# View logs in terminal where Flask is running
# Logs include: model training, anomaly detection results
```

### Audit Logs (MongoDB)
```javascript
// Query audit logs in MongoDB
use healthcareDB
db.auditlogs.find().sort({timestamp: -1}).limit(10)
```

---

## 🛡️ Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate OAuth secrets** regularly
3. **Use strong session secrets** (32+ characters)
4. **Enable HTTPS** in production
5. **Monitor anomaly detection** alerts
6. **Limit OTP attempts** (currently 3)
7. **Expire OTPs quickly** (currently 10 minutes)

---

## 📚 API Endpoints Reference

### OTP Endpoints
- `POST /api/v1/auth/register` - Register with OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP code
- `POST /api/v1/auth/resend-otp` - Resend OTP

### OAuth Endpoints
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - OAuth callback

### Anomaly Detection Endpoints
- `POST http://localhost:5000/train` - Train ML model
- `POST http://localhost:5000/detect` - Detect anomalies

---

## 🎯 Next Steps

1. **Production Deployment**:
   - Set up HTTPS certificates
   - Configure production OAuth callbacks
   - Use production email service (SendGrid, AWS SES)
   - Deploy Flask service (Docker, Kubernetes)

2. **Enhanced Features**:
   - SMS OTP via Twilio
   - More OAuth providers (Microsoft, GitHub)
   - Advanced anomaly detection rules
   - Real-time dashboard alerts

3. **Performance Optimization**:
   - Redis caching for OTPs
   - WebSocket for real-time alerts
   - ML model optimization
   - Database indexing

---

## 📞 Support

For issues or questions:
1. Check logs for error messages
2. Review configuration files
3. Verify all environment variables
4. Ensure all services are running

---

## 🎉 Features Implemented

✅ OTP Email Verification  
✅ Google OAuth Sign-In  
✅ Dark Mode Theme  
✅ AI Anomaly Detection  
✅ Email Alert System  
✅ Secure Session Management  
✅ Redux State Management  
✅ Audit Logging  

**Your secure healthcare platform is ready with enterprise-grade features!** 🚀
