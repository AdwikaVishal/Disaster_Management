# SenseSafe Emergency Response System

![SenseSafe Logo](public/vite.svg)

**SenseSafe** is a comprehensive emergency response system designed to coordinate disaster management, incident reporting, volunteer coordination, and emergency broadcasting. The system integrates real-time mapping, AI-powered risk assessment, blockchain-based incident verification, and multi-channel communication to provide a robust emergency response platform.

## 🚨 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [System Components](#system-components)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 📊 Overview

SenseSafe is built as a full-stack emergency management platform with the following core capabilities:

- **Emergency Incident Management**: Report, verify, and track incidents in real-time
- **Volunteer Coordination**: Automated volunteer assignment and task management
- **Emergency Broadcasting**: Mass notification system for critical alerts
- **AI-Powered Risk Assessment**: Machine learning models for incident triage
- **Blockchain Verification**: Secure incident verification using smart contracts
- **Real-time Communication**: WebSocket-based live updates and notifications
- **Administrative Controls**: System overrides and emergency control panel

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Boot    │    │   ML Service    │
│   (TypeScript)   │◄──►│   Backend       │◄──►│   (Python)      │
│   Port: 3001     │    │   Port: 8080    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   H2 Database   │◄─────────────┘
                        │   (Embedded)    │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Blockchain     │
                        │  Integration    │
                        └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation

**Backend:**
- Spring Boot 3.x
- Java 17
- Spring Security for authentication
- JPA/Hibernate for ORM
- H2 Database (embedded)
- WebSocket for real-time updates

**ML Services:**
- Python Flask
- Scikit-learn for ML models
- NumPy for data processing

**Additional Tools:**
- Maven for Java builds
- npm for Node.js packages
- Docker (optional for containerization)

## ✨ Features

### For Users
- 📍 **Real-time Incident Reporting**: Report emergencies with location, photos, and details
- 🗺️ **Live Emergency Map**: View incidents and emergency services in real-time
- 🆘 **SOS Emergency Button**: One-click emergency alert with automatic contact notification
- 📊 **Personal Dashboard**: Track reported incidents and volunteer activities
- 🔔 **Emergency Alerts**: Receive location-based emergency notifications

### For Volunteers
- 📝 **Volunteer Registration**: Apply to become a certified emergency volunteer
- 🎯 **Task Assignment**: Receive automated task assignments based on proximity and skills
- 📱 **Mobile-Optimized Interface**: Access tasks and updates on mobile devices
- 📈 **Performance Tracking**: Track volunteer hours and impact

### For Administrators
- 🎛️ **Emergency Control Panel**: Broadcast emergency alerts and manage system settings
- 👥 **User Management**: Manage users, volunteers, and permissions
- 🔍 **Incident Verification**: Review and verify reported incidents
- 📋 **Audit Logs**: Comprehensive logging and compliance tracking
- ⚙️ **System Overrides**: Control automated response protocols
- 📊 **Analytics Dashboard**: Monitor system performance and usage

### Advanced Features
- 🤖 **AI Risk Scoring**: Machine learning-powered incident prioritization
- 🔗 **Blockchain Verification**: Secure incident verification using smart contracts
- 📡 **Real-time Communication**: WebSocket-based live updates
- 🌍 **Multi-language Support**: Internationalization ready
- 📧 **Email Notifications**: Automated email alerts and updates

## 📋 Prerequisites

Before installing SenseSafe, ensure you have the following installed:

### Required Software
- **Java Development Kit (JDK) 17+**
  ```bash
  # Check Java version
  java -version
  ```

- **Node.js 18+ and npm**
  ```bash
  # Check Node.js version
  node --version
  npm --version
  ```

- **Maven 3.6+**
  ```bash
  # Check Maven version
  mvn --version
  ```

### Optional Software
- **Docker** (for containerized deployment)
- **Git** (for version control)
- **Python 3.8+** (for ML service development)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 🚀 Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/sensesafe-emergency-system.git
cd sensesafe-emergency-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the backend application
mvn clean compile

# The backend will be available at http://localhost:8080
```

### 3. Frontend Setup

```bash
# Navigate to root directory (from backend)
cd ..

# Install frontend dependencies
npm install

# The frontend will be available at http://localhost:3001
```

### 4. Database Setup

The system uses an embedded H2 database that automatically initializes on first run. Database files are stored in:
- Backend: `backend/data/sensesafe.mv.db`
- Logs: `backend/logs/sensesafe.log`

### 5. ML Service Setup (Optional)

```bash
# Navigate to ML service directory
cd ML

# Install Python dependencies
pip install -r requirements.txt

# Start ML service
python app.py

# The ML service will be available at http://localhost:5000
```

## 🏃‍♂️ Quick Start

### Option 1: Automated Start (Recommended)

```bash
# Use the provided start script
chmod +x start-system.sh
./start-system.sh
```

This will:
1. Start the backend server (http://localhost:8080)
2. Start the frontend development server (http://localhost:3001)
3. Start the ML service (http://localhost:5000)
4. Open your default browser to the application

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - ML Service (Optional):**
```bash
cd ML
python app.py
```

### Access the Application

- **User Interface**: http://localhost:3001
- **API Documentation**: http://localhost:8080/api
- **Admin Panel**: http://localhost:3001/admin (requires admin login)
- **ML Service**: http://localhost:5000

## 🧩 System Components

### Frontend Components

| Component | Path | Description |
|-----------|------|-------------|
| Landing Page | `/` | Public landing page |
| User Dashboard | `/dashboard` | Main user interface |
| Admin Panel | `/admin` | Administrative controls |
| Authentication | `/auth` | Login/signup pages |
| Emergency Map | `/dashboard/live-map` | Real-time incident map |

### Backend Components

| Component | Package | Description |
|-----------|---------|-------------|
| Controllers | `com.sensesafe.controller` | REST API endpoints |
| Services | `com.sensesafe.service` | Business logic |
| Models | `com.sensesafe.model` | Data entities |
| Repositories | `com.sensesafe.repository` | Data access layer |
| Security | `com.sensesafe.security` | Authentication/authorization |

### Database Schema

The system automatically creates the following tables:
- `users` - User accounts and profiles
- `incidents` - Reported emergencies
- `volunteer_applications` - Volunteer registrations
- `audit_logs` - System audit trail
- `system_config` - System configuration settings
- `otp_tokens` - One-time password tokens

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
SERVER_PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=86400000

# Email Configuration (Optional)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_TIMEOUT=30000

# Database Configuration
DB_URL=jdbc:h2:file:./data/sensesafe
DB_USERNAME=sa
DB_PASSWORD=

# Frontend Configuration
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
```

### Backend Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:file:./data/sensesafe
    username: sa
    password: 
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SPRING_MAIL_USERNAME}
    password: ${SPRING_MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}
```

### Frontend Configuration

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  timeout: 30000,
};
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/verify-signup` | Verify OTP for signup |
| POST | `/api/auth/login-user` | User login |
| POST | `/api/auth/login-admin-otp` | Request admin OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and get token |
| GET | `/api/auth/validate-token` | Validate JWT token |

### Incident Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List all incidents |
| POST | `/api/incidents` | Create new incident |
| GET | `/api/incidents/{id}` | Get incident details |
| PUT | `/api/incidents/{id}/verify` | Verify incident |
| POST | `/api/incidents/ml-analysis` | Get ML risk analysis |

### Emergency Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency/sos` | Send SOS alert |
| POST | `/api/emergency/hospital` | Contact hospital |
| POST | `/api/emergency/broadcast` | Broadcast emergency alert |

### Admin Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/system-config` | Get system configuration |
| PUT | `/api/admin/system-config/{key}` | Update system setting |
| POST | `/api/admin/system-config/initialize` | Initialize default configs |
| GET | `/api/admin/audit-logs` | Get audit logs |
| GET | `/api/admin/volunteers` | Manage volunteers |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `incident-created` | New incident reported |
| `incident-updated` | Incident status changed |
| `emergency-alert` | Emergency broadcast |
| `volunteer-assigned` | Volunteer task assigned |

## 📖 Usage Guide

### For Regular Users

#### 1. Registration and Login

1. Visit http://localhost:3001
2. Click "Sign Up" to create an account
3. Verify your email using the OTP sent to your email
4. Complete your profile with emergency contacts

#### 2. Reporting an Incident

1. Navigate to "Report Incident" in your dashboard
2. Fill in incident details:
   - Type of emergency
   - Severity level
   - Location (auto-detected or manual)
   - Description and photos
3. Submit the report
4. Track status in your dashboard

#### 3. Using SOS Feature

1. Click the red SOS button in the top navigation
2. Confirm your location and emergency details
3. System automatically:
   - Notifies your emergency contacts
   - Alerts nearby volunteers
   - Reports to authorities if enabled

#### 4. Volunteer Registration

1. Go to "Volunteer" section
2. Fill volunteer application form
3. Wait for admin approval
4. Receive task assignments automatically

### For Administrators

#### 1. Admin Login

1. Navigate to Admin Login page
2. Enter admin email: `admin@sensesafe.com`
3. Check backend console for OTP
4. Enter OTP to authenticate

#### 2. Emergency Control Panel

1. Go to Admin → Emergency Control
2. Use system override toggles:
   - **Auto-Dispatch Volunteers**: Enable/disable automatic volunteer assignment
   - **AI Risk Scoring**: Toggle ML-powered incident analysis
   - **Lockdown Mode**: Restrict system operations
3. Send emergency broadcasts:
   - Select alert type
   - Write message
   - Broadcast to affected area

#### 3. Incident Management

1. Navigate to Admin → Verification Queue
2. Review pending incidents
3. Verify or reject reports
4. Assign tasks to volunteers

#### 4. System Monitoring

1. Check Audit Logs for system activity
2. Monitor user registrations and activity
3. Review volunteer applications
4. Adjust system configurations

## 🧪 Testing

### Automated Testing

```bash
# Run backend tests
cd backend
mvn test

# Run frontend tests
cd ..
npm test

# Run ML service tests
cd ML
python -m pytest test_*.py
```

### Manual Testing

#### 1. Test User Registration
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'
```

#### 2. Test Incident Creation
```bash
curl -X POST http://localhost:8080/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "FIRE",
    "severity": "HIGH",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Building fire reported"
  }'
```

#### 3. Test Admin Authentication
```bash
# Step 1: Request OTP
curl -X POST http://localhost:8080/api/auth/login-admin-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sensesafe.com"}'

# Step 2: Verify OTP (use OTP from backend logs)
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sensesafe.com", "otp": "123456"}'
```

### System Integration Test

Run the provided test script:

```bash
chmod +x test-system-overrides.sh
./test-system-overrides.sh
```

This script will:
1. Test authentication flow
2. Verify system configuration endpoints
3. Test emergency control functionality
4. Validate API responses

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/sensesafe-backend-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
npm run build
# Serve the dist/ folder with a web server
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment-Specific Configurations

#### Development
- Use embedded H2 database
- Enable detailed logging
- CORS enabled for localhost

#### Production
- Configure external database (PostgreSQL/MySQL)
- Enable SSL/TLS
- Configure proper CORS settings
- Set up monitoring and logging

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Java version (should be 17+)
java -version

# Check if port 8080 is available
lsof -i :8080

# View backend logs
tail -f backend/logs/sensesafe.log
```

#### Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (should be 18+)
node --version
```

#### Database Connection Issues
```bash
# Check if database file exists
ls -la backend/data/

# Reset database (WARNING: This will delete all data)
rm backend/data/sensesafe.mv.db
```

#### Authentication Problems
```bash
# Check if admin user exists
# Default admin email: admin@sensesafe.com
# Check backend logs for OTP when requesting admin login

# Reset user database if needed
# (This will delete all users)
```

### Log Files

- **Backend Logs**: `backend/logs/sensesafe.log`
- **ML Service Logs**: `backend/ml-service/ml-service.log`
- **Frontend Logs**: Check browser console (F12)

### Performance Issues

1. **Memory Usage**: Ensure sufficient RAM (8GB+ recommended)
2. **Database Performance**: Consider indexing for large datasets
3. **Network Latency**: Check API response times
4. **ML Service**: Monitor model inference times

### Getting Help

1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Ensure ports 3001, 8080, and 5000 are available
4. Review the API documentation for endpoint usage
5. Check the troubleshooting guide above

## 🤝 Contributing

We welcome contributions to SenseSafe! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test && mvn test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards

- **Frontend**: Follow React and TypeScript best practices
- **Backend**: Follow Java and Spring Boot conventions
- **Commits**: Use conventional commit messages
- **Tests**: Maintain test coverage above 80%

### Areas for Contribution

- 🌍 **Internationalization**: Add support for more languages
- 📱 **Mobile App**: React Native mobile application
- 🤖 **AI Models**: Improved ML models for risk assessment
- 🔗 **Blockchain**: Enhanced smart contract functionality
- 🔐 **Security**: Security audits and improvements
- 📊 **Analytics**: Advanced reporting and analytics
- 🎨 **UI/UX**: Interface improvements and accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check this README and API docs
- **Issues**: Open an issue on GitHub
- **Security**: Report security issues privately
- **Email**: Contact the maintainers

## 🙏 Acknowledgments

- **Emergency Services**: Inspiration from real emergency response protocols
- **Open Source Community**: Libraries and frameworks that make this possible
- **Beta Testers**: Early users who helped shape the system
- **Contributors**: Everyone who has contributed to the project

---

**SenseSafe Emergency Response System** - Building safer communities through technology. 🚨🛡️

For the latest updates and information, visit our [GitHub repository](https://github.com/your-org/sensesafe-emergency-system).

