# 🔑 Environment Variables Quick Reference

## Backend Configuration (`/backend/.env`)

### Essential Variables (Already Configured)
```env
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/healthcareDB

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=aes-256-cbc
```

### NEW: Email Configuration (Required for OTP)
```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Email settings
EMAIL_FROM_NAME=Healthcare Platform
FRONTEND_URL=http://localhost:3001
```

#### How to get Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy 16-character password (format: xxxx xxxx xxxx xxxx)
6. Paste into `SMTP_PASSWORD` (remove spaces)

### NEW: Google OAuth Configuration (Required for OAuth)
```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback

# Session Secret (generate random 64-char string)
SESSION_SECRET=generate-this-with-command-below
```

#### How to get Google OAuth credentials:
1. Go to https://console.cloud.google.com/
2. Create/select project
3. Enable Google+ API
4. Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:5001/api/v1/auth/google/callback`
7. Copy Client ID and Client Secret

#### Generate Session Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### NEW: Microservices
```env
# Anomaly Detection Service
ANOMALY_DETECTION_URL=http://localhost:5000
```

---

## Frontend Configuration (`/frontend/.env`)

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5001/api/v1

# App Configuration
REACT_APP_NAME=Healthcare Platform
REACT_APP_VERSION=2.0.0
```

---

## Flask Service Configuration (`/anomaly-detection/.env`)

```env
# Flask Configuration
FLASK_ENV=development
FLASK_PORT=5000
FLASK_DEBUG=True

# Backend URL
BACKEND_URL=http://localhost:5001
```

---

## Complete Backend .env Template

Copy and paste this into `/backend/.env`:

```env
# ==============================================
# HEALTHCARE PLATFORM - BACKEND CONFIGURATION
# ==============================================

# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/healthcareDB

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
JWT_REFRESH_EXPIRE=7d

# Data Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here-change-me
ENCRYPTION_ALGORITHM=aes-256-cbc

# ==============================================
# NEW: EMAIL CONFIGURATION (For OTP & Alerts)
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password-16-chars
EMAIL_FROM_NAME=Healthcare Platform

# ==============================================
# NEW: GOOGLE OAUTH (For Social Login)
# ==============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
SESSION_SECRET=generate-random-64-character-string-here

# ==============================================
# URLs
# ==============================================
FRONTEND_URL=http://localhost:3001
ANOMALY_DETECTION_URL=http://localhost:5000

# ==============================================
# Optional: Production Settings (For later)
# ==============================================
# FRONTEND_URL=https://your-production-domain.com
# GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/v1/auth/google/callback
```

---

## Environment Variables Checklist

### ✅ Basic Setup (Already Done)
- [x] PORT
- [x] MONGODB_URI
- [x] JWT_SECRET
- [x] JWT_REFRESH_SECRET
- [x] ENCRYPTION_KEY

### 📧 OTP Email Setup
- [ ] SMTP_EMAIL (your Gmail address)
- [ ] SMTP_PASSWORD (Gmail app password)

### 🔐 Google OAuth Setup
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] SESSION_SECRET

### 🤖 Optional: Anomaly Detection
- [ ] ANOMALY_DETECTION_URL (if using Flask service)

---

## Quick Commands

### Generate Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Test Email Configuration
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test-email@gmail.com",
    "password": "Test@123456",
    "confirmPassword": "Test@123456",
    "role": "patient"
  }'
```

### Check Environment Variables Loaded
```bash
cd backend
node -e "require('dotenv').config(); console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL)"
```

---

## Security Notes

⚠️ **IMPORTANT:**
1. **Never commit `.env` files** to Git
2. Add `.env` to `.gitignore`
3. Use different secrets for production
4. Rotate secrets regularly
5. Use environment-specific configs

---

## Troubleshooting

### Email not sending?
- Check SMTP_EMAIL and SMTP_PASSWORD are set
- Verify Gmail app password is correct (16 chars)
- Ensure 2-Step Verification enabled on Gmail
- Check spam folder

### OAuth not working?
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check callback URL matches Google Console exactly
- Ensure SESSION_SECRET is set (64+ characters)
- Clear browser cookies and try again

### Variables not loading?
```bash
# Check .env file exists
ls -la /Users/jahnavisingh/healthcare/backend/.env

# Check dotenv is loading
cd backend
node -e "require('dotenv').config(); console.log(process.env)"
```

---

## Production Deployment

When deploying to production:

1. **Use environment-specific values:**
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   GOOGLE_CALLBACK_URL=https://api.your-domain.com/api/v1/auth/google/callback
   ```

2. **Use secure secrets:**
   - Generate new JWT secrets
   - Generate new encryption keys
   - Use different database
   - Enable HTTPS

3. **Use production email service:**
   - Consider SendGrid, AWS SES, or Mailgun
   - Update SMTP settings accordingly

4. **Update OAuth:**
   - Add production callback URL to Google Console
   - Use production credentials

---

## Support

If you need help configuring environment variables:
1. Check syntax (no spaces around `=`)
2. Check quotes (not needed usually)
3. Verify file location
4. Restart servers after changes
5. Check logs for loading errors

---

**Last Updated:** October 9, 2025  
**Version:** 2.0.0
