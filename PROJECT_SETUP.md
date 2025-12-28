# SenseSafe - Complete Full-Stack Setup Guide

A comprehensive disaster management system with React frontend, Java Spring Boot backend, ML services, and blockchain integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Java Backend    │    │  ML Service     │
│   (Port 3000)    │◄──►│  (Port 8080)     │◄──►│  (Port 5000)    │
│                 │    │                  │    │                 │
│ • User Dashboard │    │ • REST APIs      │    │ • Fraud Detection│
│ • Admin Panel    │    │ • WebSocket      │    │ • Risk Assessment│
│ • Real-time Map  │    │ • Authentication │    │ • Similarity     │
│ • Incident Forms │    │ • Database (H2)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Blockchain     │
                    │   (Ethereum)     │
                    │                  │
                    │ • Audit Trail    │
                    │ • Verification   │
                    │ • Immutable Logs │
                    └──────────────────┘
```

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- Python 3.9+
- Git

### 1. Frontend Setup (React + TypeScript)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend Features:**
- ✅ User authentication with role-based access
- ✅ Real-time incident reporting with geolocation
- ✅ Interactive map with D3.js integration
- ✅ Admin dashboard with analytics
- ✅ Volunteer application system
- ✅ Emergency SOS functionality
- ✅ WebSocket real-time updates

### 2. Backend Setup (Java Spring Boot)

```bash
cd backend

# Install dependencies and compile
mvn clean install

# Run the application
mvn spring-boot:run
```

**Backend Features:**
- ✅ RESTful APIs with Spring Boot
- ✅ JWT authentication with OTP for admins
- ✅ H2 in-memory database with web console
- ✅ WebSocket real-time notifications
- ✅ SMTP email integration
- ✅ ML service integration
- ✅ Blockchain logging (Web3j)
- ✅ Geolocation services
- ✅ Comprehensive admin APIs

### 3. ML Service Setup (Python Flask)

```bash
cd backend/ml-service

# Install Python dependencies
pip install -r requirements.txt

# Run ML service
python app.py
```

**ML Features:**
- ✅ Fraud detection using Random Forest
- ✅ Risk assessment algorithms
- ✅ Incident similarity analysis
- ✅ RESTful ML APIs
- ✅ Fallback integration with backend

### 4. Environment Configuration

#### Backend Configuration (`backend/src/main/resources/application.yml`)
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

#### Frontend Configuration (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/websocket
```

## 🔐 Default Login Credentials

### Admin Access (with OTP)
- **Email**: `admin@sensesafe.com`
- **Password**: `admin123`
- **OTP**: Sent to email (configure SMTP)

### Regular Users
- **Username**: `john_doe` / **Password**: `password123`
- **Username**: `jane_smith` / **Password**: `password123`

### Volunteer
- **Username**: `volunteer1` / **Password**: `password123`

## 📡 API Integration Points

### Frontend ↔ Backend
```typescript
// Example API calls from frontend
const response = await fetch('http://localhost:8080/api/incidents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(incidentData)
});
```

### Backend ↔ ML Service
```java
// Java backend calling ML service
@Autowired
private MLAnalysisService mlService;

Map<String, Object> fraudResult = mlService.analyzeFraud(incident, reporter);
```

### WebSocket Real-time Updates
```javascript
// Frontend WebSocket connection
const socket = new SockJS('http://localhost:8080/websocket');
const stompClient = Stomp.over(socket);

stompClient.subscribe('/topic/incidents', (message) => {
  const incident = JSON.parse(message.body);
  updateIncidentMap(incident);
});
```

## 🗄️ Database Access

### H2 Console
- **URL**: `http://localhost:8080/api/h2-console`
- **JDBC URL**: `jdbc:h2:mem:sensesafe`
- **Username**: `sa`
- **Password**: `password`

### Sample Data
The system automatically creates:
- Admin and user accounts
- Sample incidents with various statuses
- Volunteer applications
- Emergency response records

## 🔧 Key Features Implementation

### 1. Real-time Incident Reporting
```typescript
// Frontend incident submission
const submitIncident = async (incidentData: IncidentData) => {
  const response = await api.post('/incidents', {
    ...incidentData,
    latitude: userLocation.lat,
    longitude: userLocation.lng
  });
  
  // Real-time update via WebSocket
  websocket.send('/app/incident-update', response.data);
};
```

### 2. ML-Powered Analysis
```java
// Backend ML integration
@Service
public class IncidentService {
  
  public Incident createIncident(Incident incident) {
    // Save incident
    Incident saved = incidentRepository.save(incident);
    
    // Perform ML analysis
    Map<String, Object> fraudResult = mlService.analyzeFraud(saved, reporter);
    Map<String, Object> riskResult = mlService.analyzeRisk(saved);
    
    // Update incident with ML results
    saved.setFraudProbability((Double) fraudResult.get("fraudProbability"));
    saved.setRiskScore((Double) riskResult.get("riskScore"));
    
    return incidentRepository.save(saved);
  }
}
```

### 3. Blockchain Audit Trail
```java
// Blockchain integration
@Service
public class BlockchainService {
  
  public Map<String, Object> logVerified(Long incidentId) {
    // Log verification on blockchain
    String txHash = executeTransaction("logVerified", incidentId);
    
    return Map.of(
      "success", true,
      "transactionHash", txHash,
      "message", "Incident verification logged on blockchain"
    );
  }
}
```

### 4. Emergency SOS System
```typescript
// Frontend SOS functionality
const sendSOSAlert = async (message: string, location: Location) => {
  await api.post('/emergency/sos', {
    message,
    latitude: location.lat,
    longitude: location.lng,
    emergencyContacts: user.emergencyContacts
  });
  
  // Show confirmation
  showNotification('SOS alert sent to emergency contacts');
};
```

### 5. Volunteer Management
```java
// Backend volunteer system
@Service
public class VolunteerService {
  
  public VolunteerApplication submitApplication(VolunteerApplication app) {
    app.setStatus(ApplicationStatus.PENDING);
    VolunteerApplication saved = repository.save(app);
    
    // Notify admins
    notificationService.notifyAdmins("New volunteer application", saved);
    
    return saved;
  }
}
```

## 🎯 Advanced Features

### Real-time Map with D3.js
- Interactive incident visualization
- Geolocation-based filtering
- Risk level color coding
- Live updates via WebSocket

### Admin Dashboard Analytics
- Real-time incident statistics
- Risk distribution charts
- User trust score monitoring
- System health indicators

### Email Notification System
- OTP for admin authentication
- Emergency alerts to nearby users
- SOS notifications to emergency contacts
- Hospital alerts for medical emergencies

### Trust Score System
- Community-driven user reliability
- Automatic score adjustments
- Fraud detection integration
- Verification reward system

## 🚀 Deployment Options

### Development
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && mvn spring-boot:run

# Terminal 3: ML Service
cd backend/ml-service && python app.py
```

### Production
```bash
# Frontend build
npm run build

# Backend JAR
mvn clean package

# Docker deployment
docker-compose up -d
```

## 🔍 Testing the System

### 1. User Registration & Login
1. Open `http://localhost:3000`
2. Register new user or use existing credentials
3. Verify JWT token authentication

### 2. Incident Reporting
1. Login as user
2. Navigate to incident reporting
3. Fill form with location data
4. Verify ML analysis results
5. Check real-time updates

### 3. Admin Functions
1. Login as admin with OTP
2. Access admin dashboard
3. Review incident analytics
4. Manage volunteer applications
5. Monitor system health

### 4. Emergency Features
1. Test SOS alert system
2. Verify email notifications
3. Check emergency contact integration
4. Test hospital alert system

## 📊 System Monitoring

### Health Checks
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080/api/admin/real-time-data`
- ML Service: `http://localhost:5000/health`
- Database: `http://localhost:8080/api/h2-console`

### Real-time Metrics
- Active incidents count
- User activity statistics
- ML analysis performance
- System response times

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

## 📄 Project Structure

```
sensesafe/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Route pages
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── backend/               # Java Spring Boot
│   ├── src/main/java/     # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── ml-service/        # Python ML service
├── ML/                    # Original ML models
└── docs/                  # Documentation
```

## 🎉 Success Criteria

✅ **User Authentication**: JWT-based with role management  
✅ **Real-time Reporting**: WebSocket incident updates  
✅ **ML Integration**: Fraud detection and risk assessment  
✅ **Geolocation**: Address resolution and distance calculation  
✅ **Emergency Services**: SOS alerts and hospital notifications  
✅ **Volunteer System**: Application and approval workflow  
✅ **Admin Dashboard**: Comprehensive analytics and monitoring  
✅ **Email Integration**: SMTP notifications and OTP  
✅ **Database**: H2 with sample data and web console  
✅ **Blockchain**: Audit trail logging (simulated)  

---

**🚨 SenseSafe - Building Safer Communities Through Technology**

*Complete full-stack disaster management system ready for development and deployment.*