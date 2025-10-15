# API Documentation - Secure Healthcare Platform

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

All API requests (except registration and login) require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-MFA-Token: <mfa-token> (if MFA is enabled)
```

---

## 🔐 Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "phone": "+1234567890",
  "gender": "male",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65abc123...",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (No MFA):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65abc123...",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient",
      "mfaEnabled": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response (MFA Required):**
```json
{
  "success": true,
  "mfaRequired": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Please provide MFA code"
}
```

---

### 3. Verify MFA

**POST** `/auth/mfa/verify`

Verify MFA code and complete login.

**Request Body:**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIs...",
  "mfaCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "MFA verification successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 4. Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 5. Logout

**POST** `/auth/logout`

Logout current user.

**Headers:** Requires Authentication

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 6. Get Current User

**GET** `/auth/me`

Get currently authenticated user's information.

**Headers:** Requires Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "mfaEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🏥 Health Records Endpoints

### 1. Get Health Records

**GET** `/health-records`

Get health records (filtered by role).

**Headers:** Requires Authentication

**Query Parameters:**
- `startDate` (optional): Filter records from this date
- `endDate` (optional): Filter records until this date
- `recordType` (optional): Type of record (diagnosis, prescription, etc.)
- `status` (optional): Status (active, resolved, archived)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65abc123...",
      "patient": {
        "_id": "65abc456...",
        "firstName": "John",
        "lastName": "Doe"
      },
      "doctor": {
        "_id": "65abc789...",
        "firstName": "Dr. Jane",
        "lastName": "Smith",
        "specialization": "Cardiology"
      },
      "recordType": "diagnosis",
      "diagnosis": "Hypertension",
      "visitDate": "2024-01-15T10:00:00.000Z",
      "status": "active"
    }
  ]
}
```

---

### 2. Get Single Health Record

**GET** `/health-records/:id`

Get detailed information about a specific health record.

**Headers:** Requires Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "patient": { ... },
    "doctor": { ... },
    "recordType": "diagnosis",
    "diagnosis": "Hypertension",
    "symptoms": "High blood pressure, headache",
    "treatment": "Lifestyle changes, medication",
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "duration": "30 days"
      }
    ],
    "visitDate": "2024-01-15T10:00:00.000Z",
    "followUpDate": "2024-02-15T10:00:00.000Z",
    "status": "active"
  }
}
```

---

### 3. Create Health Record

**POST** `/health-records`

Create a new health record (Doctor/Admin only).

**Headers:** Requires Authentication + Doctor/Admin Role

**Request Body:**
```json
{
  "patient": "65abc456...",
  "recordType": "diagnosis",
  "diagnosis": "Hypertension",
  "symptoms": "High blood pressure, headache",
  "treatment": "Lifestyle changes, medication",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ],
  "visitDate": "2024-01-15T10:00:00.000Z",
  "followUpDate": "2024-02-15T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Health record created successfully",
  "data": { ... }
}
```

---

## 💓 Vitals Endpoints

### 1. Get Vitals

**GET** `/vitals`

Get vitals records (filtered by role).

**Headers:** Requires Authentication

**Query Parameters:**
- `patientId` (optional): Filter by patient ID
- `startDate` (optional): Filter from this date
- `endDate` (optional): Filter until this date
- `limit` (optional): Number of records (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65abc123...",
      "patient": {
        "_id": "65abc456...",
        "firstName": "John",
        "lastName": "Doe"
      },
      "heartRate": {
        "value": 72,
        "unit": "bpm"
      },
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80,
        "unit": "mmHg"
      },
      "temperature": {
        "value": 36.8,
        "unit": "celsius"
      },
      "bmi": 23.5,
      "isAbnormal": false,
      "recordDate": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Latest Vitals

**GET** `/vitals/latest/:patientId`

Get the most recent vitals for a patient.

**Headers:** Requires Authentication

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 3. Create Vitals

**POST** `/vitals`

Record new vitals (Doctor/Nurse/Admin only).

**Headers:** Requires Authentication + Healthcare Provider Role

**Request Body:**
```json
{
  "patient": "65abc456...",
  "heartRate": {
    "value": 72
  },
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "temperature": {
    "value": 36.8,
    "unit": "celsius"
  },
  "weight": {
    "value": 70,
    "unit": "kg"
  },
  "height": {
    "value": 175,
    "unit": "cm"
  },
  "notes": "Patient feeling well"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vitals recorded successfully",
  "data": { ... }
}
```

---

## 👤 User Endpoints

### 1. Get Profile

**GET** `/users/profile`

Get current user's profile.

**Headers:** Requires Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "mfaEnabled": false
  }
}
```

---

### 2. Update Profile

**PUT** `/users/profile`

Update user profile.

**Headers:** Requires Authentication

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

---

### 3. Change Password

**PUT** `/users/change-password`

Change user password.

**Headers:** Requires Authentication

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

---

### 4. Setup MFA

**POST** `/users/mfa/setup`

Initiate MFA setup.

**Headers:** Requires Authentication

**Response:**
```json
{
  "success": true,
  "message": "MFA setup initiated",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "otpauth://totp/Healthcare:user@example.com?secret=...",
    "backupCodes": [
      "ABC123XYZ",
      "DEF456UVW",
      ...
    ]
  }
}
```

---

## 🔧 Admin Endpoints

### 1. Get All Users

**GET** `/admin/users`

Get list of all users (Admin only).

**Headers:** Requires Authentication + Admin Role

**Query Parameters:**
- `role` (optional): Filter by role
- `isActive` (optional): Filter by active status
- `search` (optional): Search by name or email

---

### 2. Get Audit Logs

**GET** `/admin/audit-logs`

Get system audit logs (Admin only).

**Headers:** Requires Authentication + Admin Role

**Query Parameters:**
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `startDate` (optional)
- `endDate` (optional)
- `limit` (optional): Default 100

---

### 3. Get Security Alerts

**GET** `/admin/security-alerts`

Get suspicious activities (Admin only).

**Headers:** Requires Authentication + Admin Role

**Query Parameters:**
- `days` (optional): Number of days (default: 7)
- `minRiskScore` (optional): Minimum risk score (default: 50)

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📝 Notes

- All dates are in ISO 8601 format
- All encrypted fields are automatically decrypted in responses
- Rate limiting applies to all endpoints
- MFA is optional but highly recommended
- Audit logs are automatically created for all actions
