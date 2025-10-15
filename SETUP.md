# Setup Guide - Secure Healthcare Platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (v5 or higher) - running locally or cloud instance
- **Redis** (v6 or higher) - for session management and caching
- **Git** - for version control

### Installing Prerequisites

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Install Redis
brew install redis
brew services start redis
```

#### Windows
- Download and install Node.js from https://nodejs.org/
- Download and install MongoDB from https://www.mongodb.com/try/download/community
- Download and install Redis from https://redis.io/download

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -sc)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Install Redis
sudo apt-get install redis-server
sudo systemctl start redis
```

---

## 🚀 Installation Steps

### Step 1: Clone or Download the Project

If you're working with this project, navigate to the project directory:

```bash
cd /Users/jahnavisingh/healthcare
```

### Step 2: Install Dependencies

Install all dependencies for both backend and frontend:

```bash
# Install root dependencies
npm install

# This will also install backend and frontend dependencies
npm run install-all
```

Or manually:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment Variables

#### Backend Configuration

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Generate secure encryption keys:
```bash
node scripts/generateKeys.js
```

4. Edit the `.env` file and update the following values:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/healthcare_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# The encryption keys should be already filled by generateKeys.js
# If not, run: node scripts/generateKeys.js

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloud Storage (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
```

#### Frontend Configuration

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. The default configuration should work for local development. Update if needed:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_ENABLE_MFA=true
```

### Step 4: Initialize Database

From the backend directory:

```bash
cd backend

# Setup database collections and indexes
npm run db:setup
```

### Step 5: Verify Services

Ensure MongoDB and Redis are running:

```bash
# Check MongoDB status
mongo --eval "db.stats()"
# or
mongosh --eval "db.stats()"

# Check Redis status
redis-cli ping
# Should return: PONG
```

---

## 🏃‍♂️ Running the Application

### Development Mode

You have three options to run the application:

#### Option 1: Run Both Servers Concurrently (Recommended)

From the root directory:
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

#### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Option 3: Using Scripts

From root directory:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Production Mode

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Start the backend server:**
```bash
cd ../backend
NODE_ENV=production npm start
```

The backend will serve the built frontend files in production mode.

---

## 🧪 Testing the Application

### Create a Test User

You can create a test user using the API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phone": "+1234567890",
    "gender": "male",
    "role": "patient"
  }'
```

### Access the Application

1. Open your browser and go to: http://localhost:3000
2. Login with the credentials you just created
3. Explore the dashboard and features

### Test Accounts

For testing purposes, you can create multiple accounts with different roles:

- **Patient:** Basic user with access to their own health data
- **Doctor:** Can create and view health records for assigned patients
- **Nurse:** Can record vitals for assigned patients
- **Admin:** Full system access including user management

---

## 🔒 Security Verification

### 1. Check Encryption Keys

Verify that your `.env` file has proper encryption keys:

```bash
cd backend
grep "ENCRYPTION_KEY\|JWT_SECRET" .env
```

You should see long, random hex strings. **Never commit these to Git!**

### 2. Test HTTPS (Production)

For production, ensure you're using HTTPS. You can use:
- Let's Encrypt for free SSL certificates
- Cloudflare for SSL/TLS
- AWS Certificate Manager (if hosting on AWS)

### 3. Enable MFA

1. Login to your account
2. Go to Profile → Security Settings
3. Enable MFA (Two-Factor Authentication)
4. Scan the QR code with Google Authenticator or Authy

---

## 🗃️ Database Seeding (Optional)

To populate the database with sample data for testing:

```bash
cd backend
npm run db:seed
```

This will create:
- Sample users (patient, doctor, nurse, admin)
- Sample health records
- Sample vitals data

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# or
sudo systemctl status mongod

# Start MongoDB
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### Redis Connection Issues

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis
# or
sudo systemctl start redis
```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find and kill the process using the port
lsof -ti:5000 | xargs kill -9

# Or change the port in backend/.env
PORT=5001
```

### CORS Issues

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
Ensure `CORS_ORIGIN` in `backend/.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:3000
```

### Missing Dependencies

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Or clear npm cache
npm cache clean --force
npm install
```

---

## 📱 Browser Compatibility

The application is tested and supported on:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install-all

# Run database migrations (if any)
cd backend
npm run db:migrate

# Restart the application
npm run dev
```

---

## 📞 Getting Help

If you encounter issues:

1. Check the logs:
   - Backend: `backend/logs/`
   - Frontend: Browser console (F12)

2. Review error messages carefully
3. Search the documentation
4. Check GitHub issues (if applicable)

---

## ✅ Post-Installation Checklist

- [ ] MongoDB is running
- [ ] Redis is running
- [ ] Environment variables are configured
- [ ] Encryption keys are generated
- [ ] Database is initialized
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Dashboard loads properly

---

## 🎉 You're All Set!

Your Secure Healthcare Platform is now running. Explore the features:

- ✅ Secure authentication with MFA
- ✅ End-to-end encrypted health records
- ✅ Role-based access control
- ✅ Health vitals monitoring
- ✅ Audit logging
- ✅ Admin panel

For more information, see the main [README.md](../README.md) file.
