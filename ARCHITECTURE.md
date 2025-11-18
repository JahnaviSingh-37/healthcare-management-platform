# Architecture Overview

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Port 3000)                                 │  │
│  │  • Material-UI Components                                   │  │
│  │  • Redux State Management                                   │  │
│  │  • Secure Authentication UI                                 │  │
│  │  • Encrypted Data Display                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS/TLS 1.3
                            │ JWT Token Authentication
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / SERVER                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Express.js Backend (Port 5000)                             │  │
│  │                                                              │  │
│  │  Security Middleware Layer:                                 │  │
│  │  ├── Helmet.js (Security Headers)                           │  │
│  │  ├── CORS Protection                                        │  │
│  │  ├── Rate Limiting                                          │  │
│  │  ├── Input Validation                                       │  │
│  │  └── XSS/CSRF Protection                                    │  │
│  │                                                              │  │
│  │  Authentication & Authorization:                            │  │
│  │  ├── JWT Token Verification                                 │  │
│  │  ├── MFA Verification (TOTP)                                │  │
│  │  ├── Role-Based Access Control (RBAC)                       │  │
│  │  └── Session Management                                     │  │
│  │                                                              │  │
│  │  Business Logic:                                            │  │
│  │  ├── User Management                                        │  │
│  │  ├── Health Records CRUD                                    │  │
│  │  ├── Vitals Management                                      │  │
│  │  ├── Encryption/Decryption                                  │  │
│  │  └── Audit Logging                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────┬────────────────────┬─────────────────────────────┘
                │                    │
                │                    │
    ┌───────────▼──────────┐    ┌───▼────────────────┐
    │   Database Layer     │    │   Cache Layer       │
    │   MongoDB            │    │   Redis             │
    │   (Port 27017)       │    │   (Port 6379)       │
    │                      │    │                     │
    │  Collections:        │    │  • Session Store    │
    │  • users             │    │  • Rate Limiting    │
    │  • healthrecords     │    │  • Temp MFA Tokens  │
    │  • vitals            │    │  • Cache            │
    │  • auditlogs         │    │                     │
    │                      │    │                     │
    │  Encrypted Fields:   │    └─────────────────────┘
    │  • diagnosis         │
    │  • symptoms          │
    │  • treatment         │
    │  • medications       │
    │  • notes             │
    └──────────────────────┘
```

## Data Flow - Secure Health Record Access

```
┌─────────────┐
│   Patient   │
│   Browser   │
└──────┬──────┘
       │
       │ 1. Login Request (email, password)
       ▼
┌─────────────────────────────────────┐
│  Authentication Middleware          │
│  • Validate credentials             │
│  • Check account status             │
│  • Verify MFA (if enabled)          │
└──────┬──────────────────────────────┘
       │
       │ 2. Generate JWT Token
       ▼
┌─────────────────────────────────────┐
│  Authorization Middleware           │
│  • Verify JWT Token                 │
│  • Check user role                  │
│  • Validate permissions             │
└──────┬──────────────────────────────┘
       │
       │ 3. Authorized Request
       ▼
┌─────────────────────────────────────┐
│  Business Logic Layer               │
│  • Fetch health records from DB     │
│  • Apply role-based filters         │
└──────┬──────────────────────────────┘
       │
       │ 4. Encrypted data from DB
       ▼
┌─────────────────────────────────────┐
│  Encryption Layer                   │
│  • Decrypt sensitive fields         │
│  • AES-256-GCM decryption           │
└──────┬──────────────────────────────┘
       │
       │ 5. Decrypted data
       ▼
┌─────────────────────────────────────┐
│  Audit Logging                      │
│  • Log data access                  │
│  • Record user, action, timestamp   │
│  • Calculate risk score             │
└──────┬──────────────────────────────┘
       │
       │ 6. Response with health records
       ▼
┌─────────────┐
│   Patient   │
│   Browser   │
└─────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│ Layer 7: Application Security                              │
│ • Input validation                                         │
│ • Output encoding                                          │
│ • Business logic security                                  │
└────────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────────┐
│ Layer 6: Authentication & Authorization                    │
│ • JWT tokens                                               │
│ • MFA (TOTP)                                              │
│ • Role-Based Access Control (RBAC)                        │
│ • Session management                                       │
└────────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────────┐
│ Layer 5: API Security                                      │
│ • Rate limiting                                            │
│ • Request throttling                                       │
│ • API versioning                                          │
└────────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────────┐
│ Layer 4: Encryption                                        │
│ • AES-256-GCM for data at rest                            │
│ • TLS 1.3 for data in transit                             │
│ • Bcrypt for password hashing                             │
└────────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────────┐
│ Layer 3: Network Security                                  │
│ • HTTPS only                                               │
│ • Security headers (HSTS, CSP, etc.)                      │
│ • CORS protection                                          │
└────────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────────┐
│ Layer 2: Monitoring & Logging                              │
│ • Audit logs                                               │
│ • Anomaly detection                                        │
│ • Security alerts                                          │
└────────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────────┐
│ Layer 1: Infrastructure Security                           │
│ • Firewall                                                 │
│ • DDoS protection                                          │
│ • Intrusion detection                                      │
└────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│ Users Collection                                             │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ email: String (unique, indexed)                              │
│ password: String (bcrypt hashed)                             │
│ firstName: String                                            │
│ lastName: String                                             │
│ role: String (patient|doctor|nurse|admin)                    │
│ mfaEnabled: Boolean                                          │
│ mfaSecret: String (encrypted)                                │
│ loginAttempts: Number                                        │
│ lockUntil: Date                                              │
│ lastLogin: Date                                              │
│ createdAt: Date                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HealthRecords Collection                                     │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ patient: ObjectId (ref: Users)                               │
│ doctor: ObjectId (ref: Users)                                │
│ recordType: String                                           │
│ diagnosis: String (ENCRYPTED)                                │
│ symptoms: String (ENCRYPTED)                                 │
│ treatment: String (ENCRYPTED)                                │
│ medications: Array (ENCRYPTED)                               │
│ notes: String (ENCRYPTED)                                    │
│ visitDate: Date                                              │
│ status: String                                               │
│ accessLog: Array                                             │
│ createdAt: Date                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Vitals Collection                                            │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ patient: ObjectId (ref: Users)                               │
│ recordedBy: ObjectId (ref: Users)                            │
│ heartRate: Object { value, unit }                            │
│ bloodPressure: Object { systolic, diastolic, unit }          │
│ temperature: Object { value, unit }                          │
│ weight: Object { value, unit }                               │
│ height: Object { value, unit }                               │
│ bmi: Number (calculated)                                     │
│ isAbnormal: Boolean                                          │
│ abnormalityFlags: Array                                      │
│ recordDate: Date                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AuditLogs Collection                                         │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ user: ObjectId (ref: Users)                                  │
│ action: String (LOGIN|LOGOUT|CREATE|READ|UPDATE|DELETE)      │
│ resource: String                                             │
│ resourceId: ObjectId                                         │
│ ipAddress: String                                            │
│ userAgent: String                                            │
│ isSuspicious: Boolean                                        │
│ riskScore: Number (0-100)                                    │
│ timestamp: Date (indexed, TTL)                               │
└─────────────────────────────────────────────────────────────┘
```

## Encryption Flow

```
┌──────────────┐
│ Plain Data   │
│ "Diagnosis:  │
│  Hypertension│
└──────┬───────┘
       │
       │ 1. Generate IV (16 bytes random)
       ▼
┌──────────────────────────────┐
│ Encryption Process           │
│ • Algorithm: AES-256-GCM     │
│ • Key: 32-byte encryption key│
│ • IV: 16-byte random         │
└──────┬───────────────────────┘
       │
       │ 2. Encrypt with cipher
       ▼
┌──────────────────────────────┐
│ Encrypted Data               │
│ • IV (hex)                   │
│ • Auth Tag (hex)             │
│ • Encrypted text (hex)       │
└──────┬───────────────────────┘
       │
       │ 3. Combine and encode
       ▼
┌──────────────────────────────┐
│ Stored in Database           │
│ Base64 encoded string        │
│ "eyJpdiI6IjEyMzQ1Njc4..."   │
└──────────────────────────────┘

Decryption is the reverse process
```

## Deployment Architecture (Production)

```
                              ┌──────────────┐
                              │ Cloudflare   │
                              │ (CDN + WAF)  │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │ Load Balancer│
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
             ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
             │   Web Server │  │ Web Server│  │  Web Server │
             │   (Node.js)  │  │ (Node.js) │  │  (Node.js)  │
             └──────┬──────┘  └─────┬─────┘  └──────┬──────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
             ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
             │   MongoDB    │  │   Redis   │  │  Backup     │
             │   Primary    │  │   Cache   │  │  Storage    │
             │              │  │           │  │  (S3)       │
             └──────┬──────┘  └───────────┘  └─────────────┘
                    │
             ┌──────▼──────┐
             │   MongoDB   │
             │   Replica   │
             │   Sets      │
             └─────────────┘
```

## Compliance Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HIPAA Compliance                      │
├─────────────────────────────────────────────────────────┤
│ ✓ Access Control (RBAC)                                 │
│ ✓ Audit Controls (Comprehensive logging)                │
│ ✓ Integrity (Data encryption)                           │
│ ✓ Transmission Security (TLS 1.3)                       │
│ ✓ Authentication (MFA)                                  │
│ ✓ Automatic Logoff (Session timeout)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    GDPR Compliance                       │
├─────────────────────────────────────────────────────────┤
│ ✓ User Consent Management                               │
│ ✓ Right to Access (Data export)                         │
│ ✓ Right to Erasure (Data deletion)                      │
│ ✓ Data Portability                                      │
│ ✓ Privacy by Design                                     │
│ ✓ Breach Notification (< 72 hours)                      │
└─────────────────────────────────────────────────────────┘
```

---

For more details, see the [full documentation](README.md).
