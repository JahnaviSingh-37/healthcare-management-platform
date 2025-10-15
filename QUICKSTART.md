# Quick Start Guide 🚀

Get the Secure Healthcare Platform up and running in 5 minutes!

## Prerequisites

Make sure you have installed:
- Node.js (v18+)
- MongoDB
- Redis

## Installation

### 1. Install Dependencies (2 minutes)

```bash
# From the root directory
cd /Users/jahnavisingh/healthcare

# Install all dependencies
npm run install-all
```

### 2. Configure Environment (1 minute)

```bash
# Navigate to backend
cd backend

# Generate encryption keys
node scripts/generateKeys.js

# This creates a .env file with secure keys
```

### 3. Start Services (1 minute)

**Make sure MongoDB and Redis are running:**

```bash
# Check MongoDB
mongosh --eval "db.stats()"

# Check Redis
redis-cli ping
# Should return: PONG
```

**If not running, start them:**

```bash
# macOS
brew services start mongodb-community
brew services start redis

# Linux
sudo systemctl start mongod
sudo systemctl start redis
```

### 4. Setup Database (30 seconds)

```bash
# From backend directory
npm run db:setup
```

### 5. Start Application (30 seconds)

```bash
# From root directory
cd ..
npm run dev
```

This starts both:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## First Login

### Create a Test Account

1. Open http://localhost:3000
2. Click "Don't have an account? Sign Up"
3. Fill in the registration form
4. Login with your credentials

### Or use API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "DemoPass123!",
    "firstName": "Demo",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "phone": "+1234567890",
    "gender": "male",
    "role": "patient"
  }'
```

## What's Next?

- ✅ Explore the dashboard
- ✅ Check out the [full documentation](README.md)
- ✅ Review [API documentation](API_DOCUMENTATION.md)
- ✅ Read [security best practices](SECURITY.md)
- ✅ Set up MFA in your profile

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### MongoDB Connection Error
```bash
# Start MongoDB
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### Redis Connection Error
```bash
# Start Redis
brew services start redis
# or
sudo systemctl start redis
```

## Project Structure

```
healthcare/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Security middleware
│   │   └── utils/       # Encryption utilities
│   └── scripts/         # Setup scripts
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   └── utils/       # API utilities
└── docs/                # Documentation
```

## Need Help?

- 📖 Read the [Setup Guide](SETUP.md)
- 🔐 Check [Security Guide](SECURITY.md)
- 📋 View [API Docs](API_DOCUMENTATION.md)
- 💬 Open an issue on GitHub

## Features Included

✅ **Security**
- End-to-end encryption (AES-256-GCM)
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Audit logging

✅ **Health Management**
- Secure health records storage
- Vitals monitoring
- Patient-doctor assignment
- Medical history tracking

✅ **Compliance**
- HIPAA compliant
- GDPR ready
- Comprehensive audit trails
- Data encryption at rest and in transit

---

**Happy coding! 🎉**

For detailed information, see the [full documentation](README.md).
