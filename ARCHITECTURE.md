# 🏗️ System Architecture

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [Deployment Architecture](#deployment-architecture)

## Overview

The Healthcare Management Platform follows a modern three-tier architecture pattern with clear separation of concerns:

1. **Presentation Layer** (Frontend - React)
2. **Application Layer** (Backend - Node.js/Express)
3. **Data Layer** (MongoDB + Redis)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     React Application                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │ │
│  │  │   Material   │  │    Redux     │  │   Framer Motion      │ │ │
│  │  │      UI      │  │   Toolkit    │  │   Animations         │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │ │
│  │                                                                  │ │
│  │  • Responsive Design       • Dark Mode Support                 │ │
│  │  • State Management        • Real-time Updates                 │ │
│  │  • Form Validation         • Error Handling                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              │ HTTPS/TLS
                              │ REST API
                              │ JWT Tokens
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                        APPLICATION TIER                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  Express.js Backend API                         │ │
│  │                                                                  │ │
│  │  ┌──────────────────── Middleware Stack ──────────────────────┐│ │
│  │  │                                                              ││ │
│  │  │  Security Layer:                                            ││ │
│  │  │  ├─ Helmet.js (Security Headers)                           ││ │
│  │  │  ├─ CORS (Cross-Origin Resource Sharing)                   ││ │
│  │  │  ├─ Rate Limiter (DDoS Protection)                         ││ │
│  │  │  ├─ Input Sanitization                                     ││ │
│  │  │  └─ XSS/CSRF Protection                                    ││ │
│  │  │                                                              ││ │
│  │  │  Authentication Layer:                                      ││ │
│  │  │  ├─ JWT Verification                                        ││ │
│  │  │  ├─ Token Refresh                                           ││ │
│  │  │  ├─ MFA Validation (TOTP)                                   ││ │
│  │  │  └─ Session Management                                      ││ │
│  │  │                                                              ││ │
│  │  │  Authorization Layer:                                       ││ │
│  │  │  ├─ Role-Based Access Control (RBAC)                        ││ │
│  │  │  ├─ Permission Checking                                     ││ │
│  │  │  └─ Resource Ownership Validation                           ││ │
│  │  │                                                              ││ │
│  │  │  Error Handling:                                            ││ │
│  │  │  ├─ Global Error Handler                                    ││ │
│  │  │  ├─ Winston Logger                                          ││ │
│  │  │  └─ Error Response Formatter                                ││ │
│  │  └──────────────────────────────────────────────────────────── ┘│ │
│  │                                                                  │ │
│  │  ┌────────────────── Business Logic Layer ───────────────────┐ │ │
│  │  │                                                             │ │ │
│  │  │  Controllers:                                               │ │ │
│  │  │  ├─ Auth Controller (Login, Register, MFA)                 │ │ │
│  │  │  ├─ User Controller (Profile, Management)                  │ │ │
│  │  │  ├─ Health Records Controller                              │ │ │
│  │  │  ├─ Appointments Controller                                │ │ │
│  │  │  ├─ Vitals Controller                                      │ │ │
│  │  │  └─ Prescriptions Controller                               │ │ │
│  │  │                                                             │ │ │
│  │  │  Services:                                                  │ │ │
│  │  │  ├─ Encryption Service (AES-256-GCM)                        │ │ │
│  │  │  ├─ Email Service (Notifications)                           │ │ │
│  │  │  ├─ OTP Service (2FA)                                       │ │ │
│  │  │  ├─ Audit Service (Logging)                                │ │ │
│  │  │  └─ Analytics Service                                       │ │ │
│  │  └─────────────────────────────────────────────────────────── ┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────┬────────────────────┬──────────────────────────────┘
                  │                    │
                  │                    │
    ┌─────────────▼────────┐    ┌─────▼────────────┐
    │    DATA TIER         │    │   CACHE TIER      │
    │                      │    │                   │
    │  MongoDB Database    │    │   Redis Cache     │
    │  (Primary Store)     │    │   (Session/OTP)   │
    │                      │    │                   │
    │  Collections:        │    │  Storage:         │
    │  ├─ users            │    │  ├─ sessions      │
    │  ├─ healthrecords    │    │  ├─ otps          │
    │  ├─ appointments     │    │  ├─ rate_limits   │
    │  ├─ vitals           │    │  └─ temp_data     │
    │  ├─ prescriptions    │    │                   │
    │  ├─ auditlogs        │    └───────────────────┘
    │  └─ notifications    │
    │                      │
    └──────────────────────┘
            │
            │
    ┌───────▼──────────────┐
    │   ML/AI SERVICE      │
    │   (Python/Flask)     │
    │                      │
    │  Anomaly Detection:  │
    │  ├─ Login Patterns   │
    │  ├─ Access Patterns  │
    │  ├─ Data Changes     │
    │  └─ Suspicious       │
    │     Activities       │
    └──────────────────────┘
```

## Component Architecture

### Frontend Architecture

```
src/
├── components/              # Reusable UI Components
│   ├── Layout/             # Main layout wrapper
│   │   ├── Layout.js       # Main layout with header/sidebar
│   │   └── Sidebar.js      # Navigation sidebar
│   ├── ProtectedRoute.js   # Route guard for authentication
│   └── [Other Components]
│
├── pages/                  # Page-level Components
│   ├── Dashboard/          # Dashboard with statistics
│   ├── Appointments/       # Appointment management
│   │   ├── Appointments.js
│   │   └── AppointmentScheduler.js
│   ├── HealthRecords/      # Health records management
│   ├── Vitals/             # Vitals tracking
│   ├── Prescriptions/      # Prescription management
│   ├── Profile/            # User profile
│   └── Auth/               # Authentication pages
│       ├── Login.js
│       └── Register.js
│
├── store/                  # Redux State Management
│   ├── store.js            # Redux store configuration
│   ├── authSlice.js        # Authentication state
│   ├── userSlice.js        # User data state
│   └── [Other Slices]
│
├── theme/                  # Theme Configuration
│   └── theme.js            # MUI theme with dark mode
│
├── utils/                  # Utility Functions
│   ├── api.js              # Axios API client
│   └── helpers.js          # Helper functions
│
├── App.js                  # Root component with routing
└── index.js                # Application entry point
```

### Backend Architecture

```
src/
├── config/                 # Configuration Files
│   ├── database.js         # MongoDB connection
│   ├── redis.js            # Redis configuration
│   ├── passport.js         # Authentication strategy
│   └── email.js            # Email configuration
│
├── middleware/             # Express Middleware
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Global error handler
│   ├── rateLimiter.js      # Rate limiting
│   └── securityHeaders.js  # Security headers
│
├── models/                 # Mongoose Models
│   ├── User.js             # User model
│   ├── HealthRecord.js     # Health records
│   ├── Appointment.js      # Appointments
│   ├── Vitals.js           # Vital signs
│   ├── Prescription.js     # Prescriptions
│   ├── AuditLog.js         # Audit trail
│   ├── Notification.js     # Notifications
│   └── OTP.js              # OTP for 2FA
│
├── routes/                 # API Routes
│   ├── authRoutes.js       # Authentication endpoints
│   ├── userRoutes.js       # User management
│   ├── healthRecordRoutes.js
│   ├── appointmentRoutes.js
│   ├── vitalsRoutes.js
│   ├── prescriptionRoutes.js
│   ├── notificationRoutes.js
│   ├── auditRoutes.js      # Audit logs
│   └── adminRoutes.js      # Admin endpoints
│
├── utils/                  # Utility Functions
│   ├── encryption.js       # AES-256-GCM encryption
│   ├── logger.js           # Winston logger
│   └── otp.js              # OTP generation/validation
│
└── server.js               # Application entry point
```

## Data Flow

### Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /auth/login        │                          │
     │  {email, password}       │                          │
     ├─────────────────────────>│                          │
     │                          │  Find user by email      │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────┤
     │                          │  User data               │
     │                          │                          │
     │                          │  Verify password         │
     │                          │  (bcrypt.compare)        │
     │                          │                          │
     │                          │  Generate JWT token      │
     │                          │  Generate refresh token  │
     │                          │                          │
     │                          │  Log audit event         │
     │                          ├─────────────────────────>│
     │                          │                          │
     │  200 OK                  │                          │
     │  {token, user}           │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  Store token in Redux    │                          │
     │  Store token in localStorage                        │
     │                          │                          │
```

### Protected Request Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  GET /api/health-records │                          │
     │  Authorization: Bearer   │                          │
     │  <token>                 │                          │
     ├─────────────────────────>│                          │
     │                          │  Verify JWT token        │
     │                          │  Extract user ID         │
     │                          │                          │
     │                          │  Check RBAC permissions  │
     │                          │                          │
     │                          │  Query health records    │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  Decrypt sensitive data  │
     │                          │  (AES-256-GCM)           │
     │                          │                          │
     │                          │<─────────────────────────┤
     │                          │  Health records          │
     │                          │                          │
     │  200 OK                  │                          │
     │  {records}               │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

### Data Encryption Flow

```
┌──────────────┐         ┌───────────────┐         ┌──────────┐
│ Application  │         │  Encryption   │         │ Database │
│   Layer      │         │    Service    │         │          │
└──────┬───────┘         └───────┬───────┘         └────┬─────┘
       │                         │                      │
       │  Save sensitive data    │                      │
       ├────────────────────────>│                      │
       │  {diagnosis, notes}     │                      │
       │                         │                      │
       │                         │  Generate random IV  │
       │                         │  Encrypt with        │
       │                         │  AES-256-GCM         │
       │                         │                      │
       │  Encrypted data         │                      │
       │<────────────────────────┤                      │
       │  {encryptedDiagnosis,   │                      │
       │   diagnosisIV, ...}     │                      │
       │                         │                      │
       │  Store encrypted data   │                      │
       ├───────────────────────────────────────────────>│
       │                         │                      │
       │                         │                      │
       │  Retrieve data          │                      │
       │<───────────────────────────────────────────────┤
       │  {encryptedDiagnosis,   │                      │
       │   diagnosisIV}          │                      │
       │                         │                      │
       │  Decrypt data           │                      │
       ├────────────────────────>│                      │
       │                         │  Decrypt with        │
       │                         │  AES-256-GCM         │
       │                         │  using IV            │
       │                         │                      │
       │  Decrypted data         │                      │
       │<────────────────────────┤                      │
       │  {diagnosis, notes}     │                      │
```

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Layer 1: Network                      │
│  • HTTPS/TLS 1.3                                        │
│  • Certificate pinning                                  │
│  • Secure DNS                                           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│               Layer 2: Application Security              │
│  • Helmet.js (Security Headers)                         │
│  • CORS Configuration                                   │
│  • Rate Limiting                                        │
│  • Input Validation & Sanitization                      │
│  • XSS Protection                                       │
│  • CSRF Protection                                      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│          Layer 3: Authentication & Authorization         │
│  • JWT Token Authentication                             │
│  • MFA/2FA (TOTP)                                       │
│  • Role-Based Access Control (RBAC)                     │
│  • Session Management                                   │
│  • Password Hashing (bcrypt)                            │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│               Layer 4: Data Security                     │
│  • AES-256-GCM Encryption at Rest                       │
│  • Field-Level Encryption                               │
│  • Secure Key Management                                │
│  • Data Masking                                         │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│            Layer 5: Monitoring & Audit                   │
│  • Comprehensive Audit Logging                          │
│  • Anomaly Detection (ML)                               │
│  • Security Event Monitoring                            │
│  • Suspicious Activity Alerts                           │
└─────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────┐
│                           Roles                              │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   Patient    │    Doctor    │    Nurse     │     Admin     │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────┘
       │              │              │               │
       │              │              │               │
   ┌───▼───┐      ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
   │ View  │      │ View  │      │ View  │      │ View  │
   │ Own   │      │  All  │      │  All  │      │  All  │
   │ Data  │      │Patient│      │Patient│      │ Users │
   │       │      │ Data  │      │ Data  │      │       │
   └───┬───┘      └───┬───┘      └───┬───┘      └───┬───┘
       │              │              │               │
   ┌───▼───┐      ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
   │ Book  │      │Create │      │Update │      │Manage │
   │Appoint│      │Health │      │Vitals │      │ All   │
   │ments  │      │Record │      │       │      │ Data  │
   └───┬───┘      └───┬───┘      └───┬───┘      └───┬───┘
       │              │              │               │
   ┌───▼───┐      ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
   │Update │      │Create │      │Assist │      │System │
   │Profile│      │Script │      │Doctor │      │Config │
   │       │      │       │      │       │      │       │
   └───────┘      └───────┘      └───────┘      └───────┘
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['patient', 'doctor', 'nurse', 'admin']),
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: Object,
  specialization: String (for doctors),
  licenseNumber: String (for doctors),
  mfaEnabled: Boolean,
  mfaSecret: String,
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Health Record Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'User'),
  doctor: ObjectId (ref: 'User'),
  recordType: String,
  diagnosis: String (encrypted),
  diagnosisIV: String,
  symptoms: String (encrypted),
  symptomsIV: String,
  notes: String (encrypted),
  notesIV: String,
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'User'),
  doctor: ObjectId (ref: 'User'),
  appointmentDate: Date,
  timeSlot: String,
  reason: String,
  status: String (enum: ['scheduled', 'completed', 'cancelled']),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Vitals Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'User'),
  recordedBy: ObjectId (ref: 'User'),
  bloodPressureSystolic: Number,
  bloodPressureDiastolic: Number,
  heartRate: Number,
  temperature: Number,
  oxygenSaturation: Number,
  weight: Number,
  height: Number,
  notes: String,
  recordedAt: Date,
  createdAt: Date
}
```

## API Architecture

### RESTful API Design

```
Base URL: /api

Authentication:
├─ POST   /auth/register          # Register new user
├─ POST   /auth/login             # Login user
├─ POST   /auth/logout            # Logout user
├─ POST   /auth/refresh-token     # Refresh JWT token
├─ POST   /auth/forgot-password   # Request password reset
├─ POST   /auth/reset-password    # Reset password with token
├─ GET    /auth/me                # Get current user
└─ PUT    /auth/update-profile    # Update user profile

Users:
├─ GET    /users                  # Get all users (Admin)
├─ GET    /users/:id              # Get user by ID
├─ PUT    /users/:id              # Update user
├─ DELETE /users/:id              # Delete user (Admin)
└─ GET    /users/doctors          # Get all doctors

Health Records:
├─ GET    /health-records         # Get records (filtered by role)
├─ POST   /health-records         # Create record (Doctor/Admin)
├─ GET    /health-records/:id     # Get specific record
├─ PUT    /health-records/:id     # Update record (Doctor/Admin)
└─ DELETE /health-records/:id     # Delete record (Doctor/Admin)

Appointments:
├─ GET    /appointments           # Get appointments
├─ POST   /appointments           # Book appointment
├─ GET    /appointments/:id       # Get specific appointment
├─ PUT    /appointments/:id       # Update appointment
└─ DELETE /appointments/:id       # Cancel appointment

Vitals:
├─ GET    /vitals                 # Get vitals
├─ POST   /vitals                 # Add vitals
├─ GET    /vitals/:id             # Get specific vitals
├─ PUT    /vitals/:id             # Update vitals
└─ DELETE /vitals/:id             # Delete vitals

Prescriptions:
├─ GET    /prescriptions          # Get prescriptions
├─ POST   /prescriptions          # Create prescription (Doctor)
├─ GET    /prescriptions/:id      # Get specific prescription
├─ PUT    /prescriptions/:id      # Update prescription (Doctor)
└─ DELETE /prescriptions/:id      # Delete prescription (Doctor)

Notifications:
├─ GET    /notifications          # Get user notifications
├─ PUT    /notifications/:id/read # Mark as read
└─ DELETE /notifications/:id      # Delete notification

Audit:
└─ GET    /audit-logs             # Get audit logs (Admin)
```

## Deployment Architecture

### Development Environment
```
┌────────────────────────────────────────────┐
│          Local Development                  │
│                                            │
│  Frontend (localhost:3001)                 │
│  Backend (localhost:5001)                  │
│  MongoDB (localhost:27017)                 │
│  Redis (localhost:6379)                    │
│  Anomaly Detection (localhost:5002)        │
└────────────────────────────────────────────┘
```

### Production Environment (Recommended)
```
┌──────────────────────────────────────────────────────┐
│                  Load Balancer                        │
│              (NGINX / AWS ELB)                       │
└─────────────────────┬────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐          ┌───────▼────────┐
│  Frontend      │          │   Backend       │
│  (Static CDN)  │          │   (Docker)      │
│  • S3/Cloudflare│         │  • Node.js API  │
│  • HTTPS       │          │  • Multiple     │
│  • Gzip        │          │    Instances    │
└────────────────┘          └────────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
            ┌───────▼────────┐              ┌────────▼────────┐
            │   MongoDB      │              │     Redis       │
            │   (Atlas)      │              │   (Cluster)     │
            │  • Replica Set │              │  • Persistence  │
            │  • Auto-backup │              │  • High Avail   │
            └────────────────┘              └─────────────────┘
```

### Security Considerations

1. **Network Security**
   - Use VPC/private networks
   - Firewall rules for database access
   - DDoS protection

2. **Application Security**
   - Environment-specific configurations
   - Secure secret management (AWS Secrets Manager, HashiCorp Vault)
   - Regular security audits

3. **Data Security**
   - Encrypted backups
   - Data retention policies
   - HIPAA compliance measures

4. **Monitoring**
   - Application monitoring (New Relic, DataDog)
   - Log aggregation (ELK Stack)
   - Alerting systems
   - Performance metrics

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Author:** Jahnavi Singh
