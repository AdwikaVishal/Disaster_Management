# SenseSafe Backend - Java Spring Boot

A comprehensive disaster management backend system with ML integration, blockchain logging, real-time notifications, and emergency response coordination.

## 🚀 Features

### Core Functionality
- **User Management**: Registration, authentication, role-based access (User/Admin/Volunteer)
- **Incident Reporting**: Real-time incident creation with geolocation and media support
- **ML Analysis**: Fraud detection, risk assessment, and similarity analysis
- **Emergency Services**: SOS alerts, hospital notifications, emergency contact management
- **Volunteer Management**: Application system for community volunteers
- **Real-time Updates**: WebSocket-based live notifications and updates
- **Blockchain Integration**: Incident audit trail and verification logging
- **Email Notifications**: SMTP-based alerts and status updates

### Advanced Features
- **Geolocation Services**: Address geocoding, distance calculations, sensitive location detection
- **Trust Score System**: Community-driven user reliability scoring
- **Admin Dashboard**: Comprehensive analytics and system monitoring
- **H2 Database**: In-memory database with web console access
- **OTP Authentication**: Secure admin login with email-based OTP

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Security**: Spring Security with JWT authentication
- **Database**: H2 (in-memory) with JPA/Hibernate
- **Real-time**: WebSocket with STOMP messaging
- **Email**: Spring Mail with SMTP support
- **Blockchain**: Web3j for Ethereum integration
- **ML Integration**: REST client for Python ML services
- **Build Tool**: Maven
- **Java Version**: 17

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- Python ML services (optional, has fallback)
- SMTP email account (Gmail recommended)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
cd backend
mvn clean install
```

### 2. Configure Environment Variables
Create `application-local.yml` or set environment variables:

```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: your-app-password

jwt:
  secret: your-super-secret-jwt-key

blockchain:
  rpc-url: https://eth-sepolia.g.alchemy.com/v2/your-api-key
  private-key: your-private-key
  contract-address: 0x...

ml:
  base-url: http://localhost:5000
```

### 3. Run the Application
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 4. Access H2 Console
- URL: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:mem:sensesafe`
- Username: `sa`
- Password: `password`

## 🔐 Default Credentials

The system initializes with sample data:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@sensesafe.com`

### User Accounts
- **Username**: `john_doe` / **Password**: `password123`
- **Username**: `jane_smith` / **Password**: `password123`

### Volunteer Account
- **Username**: `volunteer1` / **Password**: `password123`

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register          - User registration
POST /api/auth/login             - User login
POST /api/auth/admin/request-otp - Request admin OTP
POST /api/auth/admin/verify-otp  - Verify admin OTP
POST /api/auth/validate-token    - Validate JWT token
```

### Incidents
```
GET    /api/incidents                    - Get recent incidents
POST   /api/incidents                    - Create new incident
GET    /api/incidents/{id}               - Get incident details
GET    /api/incidents/nearby             - Get nearby incidents
GET    /api/incidents/critical           - Get critical incidents
PUT    /api/incidents/{id}/status        - Update incident status (Admin)
POST   /api/incidents/{id}/verify        - Verify incident
GET    /api/incidents/statistics         - Get incident statistics (Admin)
```

### Emergency Services
```
POST   /api/emergency/sos                - Send SOS alert
GET    /api/emergency/contacts           - Get emergency service numbers
POST   /api/emergency/dial-hospital      - Alert hospitals
POST   /api/emergency/update-contacts    - Update user emergency contacts
GET    /api/emergency/user-contacts      - Get user emergency contacts
```

### Volunteers
```
POST   /api/volunteers/apply                      - Submit volunteer application
GET    /api/volunteers/applications               - Get all applications (Admin)
GET    /api/volunteers/applications/pending       - Get pending applications (Admin)
GET    /api/volunteers/applications/my            - Get user's applications
POST   /api/volunteers/applications/{id}/review   - Review application (Admin)
GET    /api/volunteers/nearby                     - Get nearby volunteers
GET    /api/volunteers/statistics                 - Get volunteer statistics (Admin)
```

### Admin Dashboard
```
GET    /api/admin/dashboard           - Get dashboard data
GET    /api/admin/statistics          - Get system statistics
GET    /api/admin/users               - Get all users
GET    /api/admin/users/{id}          - Get user details
PUT    /api/admin/users/{id}/trust-score - Update user trust score
GET    /api/admin/real-time-data      - Get real-time system data
```

### Blockchain
```
POST   /api/blockchain/verify         - Log incident verification
POST   /api/blockchain/assign         - Log resource assignment
POST   /api/blockchain/resolve        - Log incident resolution
GET    /api/blockchain/audit/{id}     - Get incident audit trail
GET    /api/blockchain/health         - Check blockchain service health
```

## 🔄 Real-time WebSocket Topics

### Public Topics
```
/topic/incidents              - New incidents
/topic/emergency-alerts       - Emergency alerts
/topic/sos-alerts            - SOS alerts
```

### User-specific Topics
```
/topic/user/{userId}         - User-specific notifications
/topic/admin/{adminId}       - Admin notifications
/topic/volunteer/{volunteerId} - Volunteer alerts
```

### Incident-specific Topics
```
/topic/incidents/{incidentId} - Incident status updates
```

## 🤖 ML Integration

The backend integrates with Python ML services for:

### Fraud Detection
- Analyzes incident reports for potential fraud
- Uses user behavior patterns and content analysis
- Provides fraud probability and confidence scores

### Risk Assessment
- Evaluates incident severity and priority
- Considers location, type, and impact factors
- Generates risk scores and levels (low/medium/high/critical)

### Similarity Analysis
- Finds similar incidents to detect duplicates
- Helps identify patterns and recurring issues
- Provides similarity scores and matching incidents

### Fallback System
If ML services are unavailable, the system uses rule-based fallback algorithms to ensure continuous operation.

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in configuration

### Email Templates
The system includes HTML email templates for:
- OTP verification
- Emergency alerts
- SOS notifications
- Hospital alerts
- Volunteer application updates

## 🔗 Blockchain Integration

### Features
- Incident verification logging
- Resource allocation tracking
- Resolution confirmation
- Audit trail generation

### Configuration
```yaml
blockchain:
  rpc-url: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
  private-key: YOUR_PRIVATE_KEY
  contract-address: YOUR_CONTRACT_ADDRESS
```

### Development Mode
The system includes simulation mode for development without actual blockchain deployment.

## 🗄️ Database Schema

### Key Entities
- **Users**: Authentication, profiles, trust scores
- **Incidents**: Reports, status, ML analysis results
- **VolunteerApplications**: Community volunteer management
- **EmergencyResponses**: Service dispatch tracking
- **IncidentVerifications**: Community verification system

### Sample Data
The system automatically creates sample data including:
- Admin and user accounts
- Sample incidents with various statuses
- Volunteer applications
- Emergency responses

## 🔧 Configuration Options

### Application Properties
```yaml
server:
  port: 8080                    # Server port
  servlet:
    context-path: /api          # API base path

spring:
  datasource:
    url: jdbc:h2:mem:sensesafe  # Database URL
  
  mail:
    host: smtp.gmail.com        # SMTP server
    port: 587                   # SMTP port

jwt:
  expiration: 86400000          # Token expiration (24 hours)

ml:
  base-url: http://localhost:5000 # ML services URL

cors:
  allowed-origins: "http://localhost:3000,http://localhost:5173"
```

## 🧪 Testing

### Run Tests
```bash
mvn test
```

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🚀 Deployment

### Production Configuration
1. Use external database (PostgreSQL/MySQL)
2. Configure production SMTP settings
3. Set up proper SSL certificates
4. Configure blockchain mainnet settings
5. Set strong JWT secrets
6. Enable production logging

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/sensesafe-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 📊 Monitoring

### Health Endpoints
- `/actuator/health` - Application health
- `/api/blockchain/health` - Blockchain service health
- `/api/admin/real-time-data` - System metrics

### Logging
- Application logs: `logs/sensesafe.log`
- Console output with structured logging
- Error tracking and debugging information

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

## 📄 License

This project is part of the SenseSafe emergency response ecosystem.

---

**🚨 Emergency Response System - Building Safer Communities with Technology**