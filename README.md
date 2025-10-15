# Secure Health Monitoring and Data Protection Platform

## 🏥 Overview
A cybersecurity-focused web application designed to protect health-related data and ensure secure access to healthcare information. This platform implements industry-standard security practices including end-to-end encryption, role-based access control, and anomaly detection.

## 🔐 Key Security Features

### 1. Data Protection
- **End-to-End Encryption**: AES-256-GCM encryption for sensitive health data
- **Field-Level Encryption**: Separate encryption for different data fields
- **Encryption Key Management**: Secure key rotation and storage
- **Data-at-Rest Encryption**: Database-level encryption

### 2. Access Control
- **Role-Based Access Control (RBAC)**: Patient, Doctor, Admin, and Nurse roles
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA
- **Session Management**: Secure JWT tokens with refresh mechanism
- **Password Security**: Bcrypt hashing with salt rounds

### 3. Security Monitoring
- **Anomaly Detection**: ML-based suspicious activity detection
- **Audit Logging**: Complete audit trail of all data access
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.

### 4. Compliance
- **HIPAA Compliance**: Following HIPAA security rules
- **GDPR Ready**: Data privacy and user consent mechanisms
- **Audit Trail**: Comprehensive logging for compliance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          Frontend (React + HTTPS)           │
│  - Secure Authentication UI                 │
│  - Encrypted Data Display                   │
│  - Health Monitoring Dashboard              │
└─────────────────┬───────────────────────────┘
                  │ TLS 1.3
┌─────────────────▼───────────────────────────┐
│       Backend API (Node.js/Express)         │
│  - JWT Authentication                       │
│  - RBAC Middleware                          │
│  - Data Encryption/Decryption               │
│  - Anomaly Detection                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Database (MongoDB/PostgreSQL)          │
│  - Encrypted Health Records                 │
│  - User Management                          │
│  - Audit Logs                               │
└─────────────────────────────────────────────┘
```

## 📋 Features

### Health Data Management
- Track vital signs (heart rate, blood pressure, temperature)
- Store medical records and prescriptions
- Upload and encrypt medical documents
- View health trends and analytics

### User Roles
1. **Patient**: View own health data, manage profile
2. **Doctor**: View assigned patients' data, add medical records
3. **Nurse**: Limited access to patient vitals
4. **Admin**: System management and user administration

### Security Features
- Login attempt monitoring
- Automatic account lockout after failed attempts
- Session timeout and automatic logout
- IP-based access restrictions (optional)
- Data access audit logs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB or PostgreSQL
- Redis (for session management)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd healthcare
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

4. **Generate encryption keys**
```bash
cd backend
npm run generate-keys
```

5. **Initialize database**
```bash
cd backend
npm run db:setup
```

6. **Start the application**

Development mode:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Production mode:
```bash
# Build frontend
cd frontend
npm run build

# Start backend with production build
cd ../backend
npm start
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/healthcare
REDIS_URL=redis://localhost:6379
JWT_SECRET=<generate-secure-secret>
JWT_REFRESH_SECRET=<generate-secure-secret>
ENCRYPTION_KEY=<generate-32-byte-key>
MFA_SECRET=<generate-secure-secret>
SESSION_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_ENABLE_MFA=true
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Security tests
cd backend
npm run test:security
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/mfa/verify` - Verify MFA code
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Health Records Endpoints
- `GET /api/health-records` - Get user's health records
- `POST /api/health-records` - Create new health record
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record

### Vitals Endpoints
- `GET /api/vitals` - Get vital signs
- `POST /api/vitals` - Add new vital reading

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/security-alerts` - View security alerts

## 🔒 Security Best Practices

### For Developers
1. Never commit sensitive keys or credentials
2. Use environment variables for configuration
3. Validate all user inputs
4. Implement proper error handling without leaking information
5. Keep dependencies updated
6. Review code for security vulnerabilities

### For Administrators
1. Enable HTTPS/TLS in production
2. Regularly rotate encryption keys
3. Monitor audit logs for suspicious activity
4. Keep backup of encryption keys securely
5. Implement network-level security (firewall, VPN)
6. Regular security audits and penetration testing

### For Users
1. Use strong, unique passwords
2. Enable MFA
3. Never share login credentials
4. Log out after use on shared devices
5. Report suspicious activity immediately

## 📝 Compliance

### HIPAA Compliance Checklist
- ✅ Access Controls
- ✅ Audit Controls
- ✅ Integrity Controls
- ✅ Transmission Security
- ✅ Encryption and Decryption
- ✅ Authentication
- ✅ Automatic Logoff

### GDPR Compliance
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ User consent management
- ✅ Right to access
- ✅ Right to erasure
- ✅ Data portability
- ✅ Breach notification

## 🛡️ Incident Response

If you suspect a security breach:
1. Immediately lock affected accounts
2. Review audit logs
3. Identify the scope of the breach
4. Notify affected users
5. Document the incident
6. Implement corrective measures

## 📚 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB / PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT, Passport.js
- **Encryption**: Node Crypto (AES-256-GCM)
- **MFA**: Speakeasy (TOTP)

### Frontend
- **Framework**: React.js
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI
- **HTTP Client**: Axios
- **Routing**: React Router
- **Charts**: Chart.js / Recharts

### Security Tools
- **Helmet.js**: Security headers
- **Express Rate Limit**: Rate limiting
- **bcrypt**: Password hashing
- **validator**: Input validation
- **hpp**: HTTP Parameter Pollution protection
- **cors**: CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For security issues, please email: security@healthcare-platform.com  
For general support: support@healthcare-platform.com

## ⚠️ Disclaimer

This is a demonstration project. For production use in healthcare settings, ensure compliance with local regulations and conduct thorough security audits.

---

**Version**: 1.0.0  
**Last Updated**: October 2025
