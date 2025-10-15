# Anomaly Detection Microservice

## Overview
Flask-based AI microservice for detecting suspicious activities in healthcare platform access logs using Isolation Forest algorithm.

## Features
- Real-time anomaly detection
- Batch processing
- Pattern analysis
- Rule-based fallback detection
- Model training endpoint

## Setup

### 1. Install Python Dependencies
```bash
cd anomaly-detection
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start the Service
```bash
python app.py
```

The service will run on http://localhost:5002

## API Endpoints

### Health Check
```bash
GET /health
```

### Detect Single Log
```bash
POST /detect
Content-Type: application/json

{
  "timestamp": "2025-10-09T10:30:00Z",
  "action": "VIEW_RECORD",
  "userRole": "doctor",
  "riskScore": 25,
  "sensitiveData": true,
  "afterHours": false,
  "dataAccessCount": 5
}
```

### Batch Detection
```bash
POST /batch-detect
Content-Type: application/json

{
  "logs": [
    {
      "id": "log1",
      "timestamp": "2025-10-09T10:30:00Z",
      "action": "VIEW_RECORD",
      ...
    }
  ]
}
```

### Train Model
```bash
POST /train
Content-Type: application/json

{
  "training_data": [
    {
      "timestamp": "2025-10-09T10:30:00Z",
      ...
    }
  ]
}
```

### Analyze Pattern
```bash
POST /analyze-pattern
Content-Type: application/json

{
  "logs": [...]
}
```

## Features Detected

### AI-Based Detection
- Uses Isolation Forest algorithm
- Learns normal access patterns
- Identifies outliers automatically

### Rule-Based Detection (Fallback)
- After-hours access (10 PM - 6 AM)
- High-risk actions (DELETE, EXPORT, etc.)
- Multiple failed attempts (>3)
- Unusual data volume (>50 records)
- Sensitive data access

## Risk Scoring
- 0-30: Low risk (normal activity)
- 31-60: Medium risk (monitor)
- 61-80: High risk (investigate)
- 81-100: Critical risk (immediate action)

## Integration
The Node.js backend calls this service at `/detect` endpoint for each audit log entry to get real-time anomaly detection results.
