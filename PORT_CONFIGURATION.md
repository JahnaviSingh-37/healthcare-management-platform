# 🚀 Quick Start - New Ports Configuration

## ⚡ Your Healthcare Platform Runs On:

```
🌐 Frontend:  http://localhost:3001
🔌 Backend:   http://localhost:5001
```

**Your other project on port 3000 will continue to work! 🎉**

---

## 🎯 Quick Commands

### Start Everything (Easiest Way)
```bash
cd /Users/jahnavisingh/healthcare
./start.sh
```

### Or Start Manually
```bash
# Terminal 1 - Backend
cd /Users/jahnavisingh/healthcare/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/jahnavisingh/healthcare/frontend
npm start
```

---

## 📋 First Time Setup

```bash
cd /Users/jahnavisingh/healthcare

# 1. Install dependencies
npm run install-all

# 2. Generate encryption keys
cd backend
node scripts/generateKeys.js

# 3. Setup database
npm run db:setup

# 4. Start the app
cd ..
./start.sh
```

---

## 🔧 Port Configuration

### Backend (`.env`)
```bash
PORT=5001
CORS_ORIGIN=http://localhost:3001
```

### Frontend (`.env`)
```bash
REACT_APP_API_URL=http://localhost:5001/api/v1
```

---

## 🌐 Access the Application

1. **Open Browser**: http://localhost:3001
2. **Register**: Create your first account
3. **Login**: Use your credentials
4. **Explore**: Dashboard, health records, vitals

---

## 🛑 Stop the Application

Press `Ctrl + C` in the terminal where it's running

---

## 🔍 Check Services

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check if Redis is running  
brew services list | grep redis

# Check what's running on ports
lsof -i :3001    # Frontend
lsof -i :5001    # Backend
lsof -i :3000    # Your other project
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Services Not Running
```bash
# Start MongoDB
brew services start mongodb-community

# Start Redis
brew services start redis
```

### Can't Connect to Backend
Check that backend is running on port 5001:
```bash
curl http://localhost:5001/api/v1/health
```

---

## 📊 Default Test Users

After running `npm run db:setup`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@healthcare.com | Admin@123 |
| Doctor | doctor@healthcare.com | Doctor@123 |
| Nurse | nurse@healthcare.com | Nurse@123 |
| Patient | patient@healthcare.com | Patient@123 |

---

## 🎨 Multiple Projects Running

You can now run both projects simultaneously:

```
Port 3000 → Your Other Project ✅
Port 3001 → Healthcare Platform ✅
Port 5001 → Healthcare API ✅
```

---

## 📚 More Help

- Full Setup: [SETUP.md](SETUP.md)
- API Docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Security: [SECURITY.md](SECURITY.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

---

**🏥 Happy Coding!**
