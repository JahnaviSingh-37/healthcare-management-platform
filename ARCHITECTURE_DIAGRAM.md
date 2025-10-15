# 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER (Port 3001)                          │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      React Frontend Application                       │  │
│  │                                                                        │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │  Login     │  │  Register    │  │  Dashboard  │  │  Dark Mode  │ │  │
│  │  │  + OAuth   │  │  + OTP       │  │             │  │  Toggle     │ │  │
│  │  └────────────┘  └──────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Redux Store (State Management)                     │  │  │
│  │  │  • authSlice      • themeSlice      • healthRecordsSlice       │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Material-UI Theme Provider                         │  │  │
│  │  │  • Light Theme      • Dark Theme      • localStorage           │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │ HTTPS/HTTP
                                    │ REST API Calls
                                    │
┌───────────────────────────────────┴───────────────────────────────────────────┐
│                      Node.js Backend Server (Port 5001)                        │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                           Express.js API                                  │ │
│  │                                                                            │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌────────────────┐ │ │
│  │  │  Auth       │  │  OTP         │  │  OAuth     │  │  Health        │ │ │
│  │  │  Routes     │  │  Verify      │  │  Google    │  │  Records       │ │ │
│  │  └─────────────┘  └──────────────┘  └────────────┘  └────────────────┘ │ │
│  │                                                                            │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    Middleware Layer                               │   │ │
│  │  │  • JWT Auth   • Rate Limiter   • Error Handler   • CORS         │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                            │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    Services Layer                                 │   │ │
│  │  │  • Email Service   • OTP Service   • Passport OAuth              │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                         External Integrations                             │ │
│  │                                                                            │ │
│  │  ┌──────────────┐         ┌─────────────┐         ┌─────────────────┐  │ │
│  │  │  Gmail SMTP  │◄────────┤  Nodemailer │         │  Google OAuth   │  │ │
│  │  │  (Port 587)  │         │  Service    │         │  Service        │  │ │
│  │  └──────────────┘         └─────────────┘         └─────────────────┘  │ │
│  │       ▲                                                     ▲             │ │
│  │       │ OTP Emails                                          │             │ │
│  │       │ Security Alerts                         OAuth Redirect/Callback  │ │
│  └───────┼─────────────────────────────────────────────────────┼─────────────┘ │
│          │                                                     │                │
└──────────┼─────────────────────────────────────────────────────┼────────────────┘
           │                                                     │
           │                                                     │
┌──────────┴────────────────┐                    ┌──────────────┴─────────────────┐
│    Gmail SMTP Server      │                    │   Google OAuth 2.0 Server      │
│  smtp.gmail.com:587       │                    │  accounts.google.com           │
└───────────────────────────┘                    └────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│              Flask Microservice - AI Anomaly Detection (Port 5000)          │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Flask REST API                                    │  │
│  │                                                                        │  │
│  │  ┌─────────────────┐              ┌──────────────────┐              │  │
│  │  │  POST /train    │              │  POST /detect    │              │  │
│  │  │  Train ML Model │              │  Detect Anomaly  │              │  │
│  │  └─────────────────┘              └──────────────────┘              │  │
│  │                                                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Machine Learning Engine                            │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌──────────────────────┐    ┌────────────────────────────┐   │  │  │
│  │  │  │  Isolation Forest    │    │  Feature Engineering       │   │  │  │
│  │  │  │  • 100 estimators    │    │  • Hour of day            │   │  │  │
│  │  │  │  • 0.1 contamination │    │  • Day of week            │   │  │  │
│  │  │  │  • sklearn library   │    │  • Access frequency       │   │  │  │
│  │  │  │                      │    │  • IP change detection    │   │  │  │
│  │  │  └──────────────────────┘    └────────────────────────────┘   │  │  │
│  │  │                                                                  │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │ HTTP REST API
                                    │ Anomaly Scores
                                    │
┌───────────────────────────────────┴───────────────────────────────────────────┐
│                       Backend Can Call Flask API                               │
│                    (Future Integration for Auto-Detection)                     │
└────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MongoDB Database (Port 27017)                            │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          Collections                                  │   │
│  │                                                                        │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌────────────┐  ┌──────────────┐ │   │
│  │  │   users    │  │    otps     │  │ auditlogs  │  │ healthrecords│ │   │
│  │  │            │  │             │  │            │  │              │ │   │
│  │  │ • email    │  │ • email     │  │ • user     │  │ • patient    │ │   │
│  │  │ • password │  │ • code      │  │ • action   │  │ • diagnosis  │ │   │
│  │  │ • googleId │  │ • purpose   │  │ • details  │  │ • encrypted  │ │   │
│  │  │ • role     │  │ • expiresAt │  │ • timestamp│  │              │ │   │
│  │  │ • mfaEnabled  │ • attempts │  │ • ip       │  │              │ │   │
│  │  └────────────┘  └─────────────┘  └────────────┘  └──────────────┘ │   │
│  │                      ▲                                                │   │
│  │                      │ TTL Index                                      │   │
│  │                      │ Auto-deletes expired OTPs                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                             Data Flow Diagrams                                │
└─────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
  OTP VERIFICATION FLOW
════════════════════════════════════════════════════════════════════════════════

  User              Frontend           Backend            MongoDB         Gmail
   │                   │                  │                  │              │
   │ 1. Register       │                  │                  │              │
   ├──────────────────>│                  │                  │              │
   │                   │ 2. POST /register│                  │              │
   │                   ├─────────────────>│                  │              │
   │                   │                  │ 3. Create User   │              │
   │                   │                  ├─────────────────>│              │
   │                   │                  │                  │              │
   │                   │                  │ 4. Generate OTP  │              │
   │                   │                  │ 5. Save to DB    │              │
   │                   │                  ├─────────────────>│              │
   │                   │                  │                  │              │
   │                   │                  │ 6. Send Email    │              │
   │                   │                  ├─────────────────────────────────>│
   │                   │                  │                  │              │
   │                   │ 7. Response      │                  │              │
   │                   │<─────────────────┤                  │              │
   │ 8. Show OTP Input │                  │                  │              │
   │<──────────────────┤                  │                  │              │
   │                   │                  │                  │              │
   │ 9. Enter OTP      │                  │                  │              │
   ├──────────────────>│                  │                  │              │
   │                   │ 10. POST /verify-otp                │              │
   │                   ├─────────────────>│                  │              │
   │                   │                  │ 11. Check OTP    │              │
   │                   │                  ├─────────────────>│              │
   │                   │                  │ 12. Valid!       │              │
   │                   │                  │<─────────────────┤              │
   │                   │ 13. JWT Tokens   │                  │              │
   │                   │<─────────────────┤                  │              │
   │ 14. Redirect to   │                  │                  │              │
   │     Dashboard     │                  │                  │              │
   │<──────────────────┤                  │                  │              │


════════════════════════════════════════════════════════════════════════════════
  GOOGLE OAUTH FLOW
════════════════════════════════════════════════════════════════════════════════

  User         Frontend        Backend         Google OAuth      MongoDB
   │               │               │                 │              │
   │ 1. Click OAuth│               │                 │              │
   ├──────────────>│               │                 │              │
   │               │ 2. Redirect to backend/google   │              │
   │               ├──────────────>│                 │              │
   │               │               │ 3. Redirect to  │              │
   │               │               │    Google       │              │
   │               │               ├────────────────>│              │
   │               │               │                 │              │
   │ 4. Google Sign-In Page        │                 │              │
   │<──────────────────────────────┼─────────────────┤              │
   │                               │                 │              │
   │ 5. Authorize                  │                 │              │
   ├───────────────────────────────┼─────────────────>│              │
   │                               │                 │              │
   │                               │ 6. OAuth callback              │
   │                               │<────────────────┤              │
   │                               │                 │              │
   │                               │ 7. Create/Find User            │
   │                               ├────────────────────────────────>│
   │                               │                 │              │
   │                               │ 8. Generate JWT │              │
   │                               │ 9. Redirect with tokens        │
   │               │<──────────────┤                 │              │
   │ 10. Dashboard │               │                 │              │
   │<──────────────┤               │                 │              │


════════════════════════════════════════════════════════════════════════════════
  DARK MODE FLOW
════════════════════════════════════════════════════════════════════════════════

  User              Frontend Redux       localStorage      Material-UI
   │                   │                      │                 │
   │ 1. Click Toggle   │                      │                 │
   ├──────────────────>│                      │                 │
   │                   │ 2. Dispatch Action   │                 │
   │                   │    toggleDarkMode()  │                 │
   │                   │                      │                 │
   │                   │ 3. Update State      │                 │
   │                   │    darkMode = true   │                 │
   │                   │                      │                 │
   │                   │ 4. Save to localStorage                │
   │                   ├─────────────────────>│                 │
   │                   │                      │                 │
   │                   │ 5. Select new theme  │                 │
   │                   ├─────────────────────────────────────────>│
   │                   │                      │                 │
   │                   │ 6. Apply theme       │                 │
   │ 7. UI Updates     │<─────────────────────────────────────────┤
   │<──────────────────┤                      │                 │
   │                   │                      │                 │
   │ 8. Refresh Page   │                      │                 │
   ├──────────────────>│                      │                 │
   │                   │ 9. Load from storage │                 │
   │                   ├─────────────────────>│                 │
   │                   │ 10. Restore theme    │                 │
   │                   │<─────────────────────┤                 │
   │ 11. Dark mode     │                      │                 │
   │     persisted!    │                      │                 │
   │<──────────────────┤                      │                 │


════════════════════════════════════════════════════════════════════════════════
  ANOMALY DETECTION FLOW (Future Integration)
════════════════════════════════════════════════════════════════════════════════

  User Login      Backend          MongoDB         Flask ML        Email
      │              │                 │               │              │
      │ 1. Login     │                 │               │              │
      ├─────────────>│                 │               │              │
      │              │ 2. Auth Success │               │              │
      │              │                 │               │              │
      │              │ 3. Log Access   │               │              │
      │              ├────────────────>│               │              │
      │              │                 │               │              │
      │              │ 4. Send to ML   │               │              │
      │              ├─────────────────────────────────>│              │
      │              │                 │ 5. Analyze    │              │
      │              │                 │    Pattern    │              │
      │              │                 │               │              │
      │              │ 6. Anomaly Score = 0.85         │              │
      │              │<─────────────────────────────────┤              │
      │              │                 │               │              │
      │              │ 7. If anomaly detected          │              │
      │              │    (score > 0.7)                │              │
      │              │                 │               │              │
      │              │ 8. Send Alert   │               │              │
      │              ├─────────────────────────────────────────────────>│
      │              │                 │               │              │
      │              │ 9. Log Alert    │               │              │
      │              ├────────────────>│               │              │
      │              │                 │               │              │
      │ 10. Continue │                 │               │              │
      │<─────────────┤                 │               │              │


════════════════════════════════════════════════════════════════════════════════
  SECURITY LAYERS
════════════════════════════════════════════════════════════════════════════════

  ┌────────────────────────────────────────────────────────────────────────┐
  │                        Application Security Stack                       │
  ├────────────────────────────────────────────────────────────────────────┤
  │  Layer 7: AI Anomaly Detection (Behavioral Analysis)                   │
  │  Layer 6: Email Alerts (Incident Response)                             │
  │  Layer 5: Multi-Factor Auth - OTP (Additional Verification)            │
  │  Layer 4: OAuth 2.0 (Trusted Third-Party Auth)                         │
  │  Layer 3: JWT Tokens (Stateless Session Management)                    │
  │  Layer 2: Rate Limiting (Brute Force Protection)                       │
  │  Layer 1: HTTPS/TLS (Transport Encryption)                             │
  │  Layer 0: MongoDB Encryption (Data at Rest)                            │
  └────────────────────────────────────────────────────────────────────────┘

```

## 🎯 Key Architectural Highlights

### 🔐 Security Architecture
- **Multi-layered security** with 8 distinct protection layers
- **Zero-trust model** with JWT verification on every request
- **Defense in depth** with multiple authentication methods
- **AI-powered monitoring** for behavioral anomaly detection

### 📊 Scalability Design
- **Microservices architecture** (Flask service separated)
- **Stateless backend** with JWT tokens
- **Database indexing** for fast queries
- **TTL indexes** for automatic data cleanup

### 🎨 Frontend Architecture
- **Redux centralized state** for predictable data flow
- **Material-UI components** for consistent design
- **Theme provider** for dynamic styling
- **React Router** for client-side navigation

### 🔄 Data Flow Patterns
- **Unidirectional data flow** (React → Redux → Components)
- **Async operations** with Redux Thunk
- **Optimistic updates** for better UX
- **Error boundaries** for graceful failures

### 🚀 Performance Optimizations
- **Lazy loading** for code splitting
- **MongoDB indexes** for query performance
- **JWT caching** in localStorage
- **ML model persistence** in Flask

---

**This architecture ensures:**
- ✅ High security with multiple auth layers
- ✅ Scalability with microservices
- ✅ Maintainability with clean separation
- ✅ Performance with optimized data flow
- ✅ User experience with modern UI patterns

---

**Version:** 2.0.0  
**Last Updated:** October 10, 2025
