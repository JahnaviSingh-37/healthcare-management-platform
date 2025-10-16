# 🏥 Healthcare Management Platform

> A comprehensive, secure healthcare management system with advanced security features, role-based access control, and real-time health monitoring capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-green.svg)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Healthcare Management Platform is a modern, full-stack web application designed to streamline healthcare operations while maintaining the highest security standards. It provides comprehensive tools for managing patient records, appointments, vitals, and prescriptions with role-based access control.

### Key Highlights

- 🔐 **Enterprise-Grade Security**: AES-256-GCM encryption, JWT authentication, and MFA support
- 👥 **Role-Based Access Control**: Patient, Doctor, Nurse, and Admin roles with granular permissions
- 📊 **Real-Time Monitoring**: Live health vitals tracking and analytics
- 🎨 **Modern UI/UX**: Responsive Material-UI design with dark mode support
- 🤖 **AI-Powered**: Anomaly detection for suspicious activities
- 📱 **Mobile-Friendly**: Fully responsive design for all devices

## ✨ Features

### For Patients
- 📅 Book and manage appointments with doctors
- 📋 View personal health records and medical history
- 💊 Access prescriptions and medication details
- 📈 Track vital signs (blood pressure, heart rate, temperature, etc.)
- 🔔 Receive real-time notifications
- 👤 Manage profile and personal information

### For Doctors
- 👨‍⚕️ Manage patient appointments and schedules
- 📝 Create and update health records
- 💊 Prescribe medications with detailed instructions
- 📊 View patient vitals and health trends
- 👥 Access patient information securely
- 📈 Dashboard with patient statistics

### For Administrators
- 👥 User management and role assignment
- 📊 System-wide analytics and reporting
- 🔍 Audit logs and security monitoring
- ⚙️ System configuration and settings
- 🚨 Anomaly detection alerts

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  • Material-UI Components    • Redux State Management       │
│  • Framer Motion Animations  • Responsive Design            │
│  • Dark Mode Support         • Real-time Updates            │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTPS)
                         │ JWT Authentication
┌────────────────────────▼────────────────────────────────────┐
│                Backend (Node.js/Express)                     │
│  • Authentication & Authorization  • Business Logic         │
│  • Data Encryption/Decryption     • Rate Limiting           │
│  • Security Middleware            • Audit Logging           │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
┌─────────▼─────────┐         ┌────────▼──────────┐
│  MongoDB Database  │         │  Redis Cache      │
│  • User Data       │         │  • Sessions       │
│  • Health Records  │         │  • Rate Limiting  │
│  • Appointments    │         │  • OTP Storage    │
└────────────────────┘         └───────────────────┘
          │
┌─────────▼──────────────┐
│  Anomaly Detection     │
│  (Python/Flask)        │
│  • ML-based Detection  │
│  • Activity Analysis   │
└────────────────────────┘
```

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Redis** - Caching & sessions
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Security
- **Helmet.js** - Security headers
- **Express Rate Limit** - Rate limiting
- **Crypto** - Encryption (AES-256-GCM)
- **Speakeasy** - MFA/TOTP
- **Winston** - Logging

### ML/AI
- **Python/Flask** - Anomaly detection service
- **Scikit-learn** - Machine learning
- **Pandas** - Data processing

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 6.x or higher
- **Redis** (optional, for caching)
- **Python** 3.8+ (for anomaly detection)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JahnaviSingh-37/healthcare-management-platform.git
   cd healthcare-management-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install anomaly detection dependencies**
   ```bash
   cd ../anomaly-detection
   pip install -r requirements.txt
   ```

### Configuration

1. **Backend Environment Variables**
   
   Create `backend/.env`:
   ```env
   # Server
   NODE_ENV=development
   PORT=5001

   # Database
   DATABASE_URL=mongodb://localhost:27017/healthcare_db

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Encryption
   ENCRYPTION_KEY=your-32-byte-encryption-key-here
   ENCRYPTION_ALGORITHM=aes-256-gcm

   # Redis (optional)
   REDIS_URL=redis://localhost:6379

   # Email (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password

   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

2. **Frontend Environment Variables**
   
   Create `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   ```

### Running the Application

#### Option 1: Using the start script (Recommended)
```bash
# From root directory
chmod +x start.sh
./start.sh
```

#### Option 2: Manual startup

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Anomaly Detection (Optional):**
```bash
cd anomaly-detection
python app.py
```

### Accessing the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api-docs (if Swagger is configured)

### Default Credentials

After seeding the database:

**Admin:**
- Email: `admin@hospital.com`
- Password: `Admin@123`

**Doctor:**
- Email: `dr.sarah.wilson@hospital.com`
- Password: `Doctor@123`

**Patient:**
- Email: `john.smith@email.com`
- Password: `Patient@123`

## 📁 Project Structure

```
healthcare-management-platform/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Entry point
│   ├── scripts/               # Database scripts
│   └── package.json
│
├── frontend/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store
│   │   ├── theme/             # Theme configuration
│   │   ├── utils/             # Utility functions
│   │   ├── App.js             # Root component
│   │   └── index.js           # Entry point
│   └── package.json
│
├── anomaly-detection/         # ML service
│   ├── app.py                 # Flask API
│   ├── requirements.txt
│   └── README.md
│
├── ARCHITECTURE.md            # Architecture documentation
├── README.md                  # This file
├── LICENSE                    # MIT License
└── start.sh                   # Startup script
```

## 🔒 Security Features

### Data Protection
- **AES-256-GCM Encryption**: All sensitive health data encrypted at rest
- **Field-Level Encryption**: Individual fields encrypted with unique IVs
- **Secure Key Management**: Encryption keys stored securely
- **TLS/SSL**: All data encrypted in transit

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Long-lived sessions with refresh mechanism
- **MFA Support**: Two-factor authentication using TOTP
- **Password Security**: Bcrypt hashing with salt rounds
- **Role-Based Access Control**: Granular permissions by role

### Security Middleware
- **Helmet.js**: Security headers (CSP, HSTS, X-Frame-Options)
- **CORS Protection**: Configurable cross-origin policies
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Sanitization and validation of all inputs
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention

### Monitoring & Compliance
- **Audit Logging**: Complete trail of all data access
- **Anomaly Detection**: ML-based suspicious activity detection
- **Security Alerts**: Real-time notifications of security events
- **HIPAA Compliance**: Following healthcare data standards
- **GDPR Ready**: Data privacy and consent mechanisms

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
POST   /api/auth/forgot-password # Request password reset
POST   /api/auth/reset-password  # Reset password
GET    /api/auth/me              # Get current user
PUT    /api/auth/update-profile  # Update profile
```

### User Endpoints
```
GET    /api/users                # Get all users (Admin)
GET    /api/users/:id            # Get user by ID
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user (Admin)
GET    /api/users/doctors        # Get all doctors
```

### Health Records Endpoints
```
GET    /api/health-records       # Get health records
POST   /api/health-records       # Create record (Doctor)
GET    /api/health-records/:id   # Get record by ID
PUT    /api/health-records/:id   # Update record (Doctor)
DELETE /api/health-records/:id   # Delete record (Doctor/Admin)
```

### Appointment Endpoints
```
GET    /api/appointments         # Get appointments
POST   /api/appointments         # Book appointment
GET    /api/appointments/:id     # Get appointment by ID
PUT    /api/appointments/:id     # Update appointment
DELETE /api/appointments/:id     # Cancel appointment
```

### Vitals Endpoints
```
GET    /api/vitals               # Get vitals
POST   /api/vitals               # Add vitals
GET    /api/vitals/:id           # Get vitals by ID
PUT    /api/vitals/:id           # Update vitals
DELETE /api/vitals/:id           # Delete vitals
```

### Prescription Endpoints
```
GET    /api/prescriptions        # Get prescriptions
POST   /api/prescriptions        # Create prescription (Doctor)
GET    /api/prescriptions/:id    # Get prescription by ID
PUT    /api/prescriptions/:id    # Update prescription (Doctor)
DELETE /api/prescriptions/:id    # Delete prescription (Doctor)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jahnavi Singh**
- GitHub: [@JahnaviSingh-37](https://github.com/JahnaviSingh-37)

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- MongoDB team for the excellent database
- Express.js community for the robust framework
- React team for the amazing UI library

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ by Jahnavi Singh
