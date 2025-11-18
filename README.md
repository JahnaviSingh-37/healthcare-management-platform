# Secure Healthcare Management Platform

## 🏥 Overview
A **HIPAA-compliant** healthcare management platform with enterprise-grade security, governance, and compliance features. This system demonstrates practical implementation of cybersecurity controls, risk management, and regulatory compliance for handling Protected Health Information (PHI).

**Perfect for**: GRC roles, Healthcare IT, Cybersecurity positions, Compliance roles

**Key Differentiators**: Real-world HIPAA compliance implementation, comprehensive audit logging, ML-based threat detection, and complete security lifecycle management.

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

### 4. Compliance & Governance
- **HIPAA Compliance**: Full implementation of HIPAA Security Rule (Administrative, Physical, Technical Safeguards)
- **GDPR Ready**: Data privacy, user consent, and data subject rights
- **Audit Trail**: Comprehensive logging for compliance reporting and forensic analysis
- **Risk Management**: ML-based anomaly detection for proactive threat identification
- **NIST Framework**: Aligned with NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover)
- **OWASP Top 10**: Mitigation strategies for all OWASP Top 10 vulnerabilities

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

### Clinical Data Management
- **Vitals Monitoring**: Track heart rate, blood pressure, temperature, oxygen saturation, weight, height
- **Health Records**: Encrypted medical records, diagnoses, treatments (doctor-only access)
- **Prescriptions**: Medication management and tracking
- **Appointments**: Schedule and manage patient-doctor appointments
- **Lab Results**: Secure storage and retrieval of test results

### Role-Based Access Control (RBAC)
1. **Patient**: 
   - View own health data and medical history
   - Record personal vitals
   - Schedule appointments
   - Manage profile and preferences

2. **Doctor**: 
   - Access assigned patients' complete medical records
   - Add diagnoses and treatment plans
   - Prescribe medications
   - View patient vitals and trends

3. **Nurse**: 
   - Limited access to patient vitals
   - Record vital signs for patients
   - View basic patient information

4. **Admin**: 
   - System management and configuration
   - User account administration
   - Security monitoring and audit log access
   - System-wide analytics and reporting

### Governance, Risk & Compliance (GRC) Features
- **Comprehensive Audit Trail**: Every data access logged with user, timestamp, action, and IP
- **Anomaly Detection**: ML-based system flags suspicious user behavior patterns
- **Risk Indicators**: Failed logins, unusual access patterns, privilege escalation attempts
- **Compliance Reporting**: Exportable audit logs for regulatory reporting
- **Data Subject Rights**: Support for GDPR-style data access and deletion requests
- **Incident Response**: Automated alerts for security events

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

## � Compliance & Security Documentation

- **[COMPLIANCE.md](./COMPLIANCE.md)** - Detailed HIPAA compliance implementation, NIST alignment, OWASP mitigation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and security design
- **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting

## 🎯 GRC Skills Demonstrated

This project showcases practical experience in:

### Governance
- ✅ Policy enforcement through RBAC
- ✅ Access control management
- ✅ Security architecture design
- ✅ Separation of duties

### Risk Management
- ✅ Threat identification (anomaly detection)
- ✅ Risk assessment automation
- ✅ Security monitoring and alerting
- ✅ Incident detection and response

### Compliance
- ✅ HIPAA Security Rule implementation
- ✅ NIST Cybersecurity Framework alignment
- ✅ OWASP Top 10 mitigation
- ✅ Audit logging for regulatory reporting
- ✅ Data privacy controls (GDPR-ready)

### Technical Security
- ✅ Encryption implementation (at rest and in transit)
- ✅ Authentication and authorization
- ✅ Secure coding practices
- ✅ Security testing and validation

## �🔒 Security Best Practices

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

## � For Recruiters & Hiring Managers

### Why This Project Stands Out for GRC Roles

This platform demonstrates:
1. **Practical Compliance Knowledge**: Real HIPAA implementation, not just theory
2. **Risk Management Skills**: Automated threat detection and monitoring
3. **Technical Competency**: Can translate compliance requirements into technical controls
4. **Security Mindset**: Security-first architecture from the ground up
5. **Documentation**: Professional compliance documentation and policies

### Relevant for These Roles
- GRC Analyst
- Compliance Analyst (Healthcare IT)
- Information Security Analyst
- Risk Analyst
- IT Auditor
- Cybersecurity GRC Specialist
- Healthcare Information Security Officer

## 📞 Contact

- **Developer**: Jahnavi Singh
- **GitHub**: [@JahnaviSingh-37](https://github.com/JahnaviSingh-37)
- **Repository**: [healthcare-management-platform](https://github.com/JahnaviSingh-37/healthcare-management-platform)

For security issues, please see [SECURITY.md](./SECURITY.md)

## ⚠️ Disclaimer

This is a portfolio/demonstration project showcasing security and compliance best practices. For production healthcare environments, conduct thorough security audits, penetration testing, and ensure compliance with local regulations before deployment.

---

**Version**: 1.0.0  
**Last Updated**: November 18, 2025  
**Maintained by**: Jahnavi Singh
