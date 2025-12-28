# How to Run the Full SenseSafe System

## 🚀 Complete System Startup Guide

This guide will help you run the entire SenseSafe disaster management system with all components: Frontend, Backend, ML Service, and Blockchain integration.

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
2. **Java** (JDK 17 or higher)
3. **Maven** (3.6 or higher)
4. **Python** (3.8 or higher)
5. **Git**

### Installation Commands
```bash
# Check versions
node --version    # Should be v18+
java --version    # Should be 17+
mvn --version     # Should be 3.6+
python --version  # Should be 3.8+
```

## 🔧 System Architecture

The system consists of 4 main components:
- **Frontend** (React + TypeScript) - Port 3000/5173
- **Backend** (Spring Boot + Java) - Port 8080
- **ML Service** (Python + Flask) - Port 5001
- **Blockchain** (Ethereum integration) - External network

## 📦 Step 1: Install Dependencies

### Frontend Dependencies
```bash
# Install Node.js dependencies
npm install
```

### Backend Dependencies
```bash
# Navigate to backend directory
cd backend

# Install Maven dependencies
mvn clean install
```

### ML Service Dependencies
```bash
# Navigate to ML service directory
cd backend/ml-service

# Install Python dependencies
pip install -r requirements.txt
# OR if you have conda:
conda install --file requirements.txt
```

## 🚀 Step 2: Start All Services

### Option A: Manual Startup (Recommended for Development)

#### Terminal 1: Start ML Service
```bash
cd backend/ml-service
PORT=5001 python app.py
```
**Expected Output:**
```
 * Running on http://127.0.0.1:5001
 * Debug mode: on
ML models loaded successfully
Fraud detection model ready
Risk assessment model ready
Similarity analysis model ready
```

#### Terminal 2: Start Backend
```bash
cd backend
mvn spring-boot:run
```
**Expected Output:**
```
Started SenseSafeApplication in X.XXX seconds
H2 console available at: http://localhost:8080/api/h2-console
Blockchain service initialized successfully
ML service connection: healthy
WebSocket server started on port 8080
```

#### Terminal 3: Start Frontend
```bash
npm run dev
```
**Expected Output:**
```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Option B: Quick Start Script

Create a startup script for convenience:

```bash
# Create start-all.sh
cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting SenseSafe Full System..."

# Start ML Service
echo "📊 Starting ML Service..."
cd backend/ml-service
python app.py &
ML_PID=$!
cd ../..

# Wait for ML service to start
sleep 10

# Start Backend
echo "🔧 Starting Backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 20

# Start Frontend
echo "🎨 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "ML Service PID: $ML_PID"
echo "Backend PID: $BACKEND_PID" 
echo "Frontend PID: $FRONTEND_PID"

# Keep script running
wait
EOF

chmod +x start-all.sh
./start-all.sh
```

## 🔍 Step 3: Verify System Health

### Check Service Status

#### 1. ML Service Health Check
```bash
curl http://localhost:5001/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "models": {
    "fraud_detector": "loaded",
    "risk_model": "loaded", 
    "similarity_model": "loaded"
  }
}
```

#### 2. Backend Health Check
```bash
curl http://localhost:8080/api/incidents/ml-health
```
**Expected Response:**
```json
{
  "mlServiceStatus": "healthy",
  "blockchainStatus": "healthy",
  "databaseStatus": "connected"
}
```

#### 3. Frontend Access
Open browser and navigate to: `http://localhost:3000`

You should see the SenseSafe homepage with:
- Real-time dashboard
- Incident reporting form
- Emergency SOS button
- System status indicators

## 🎯 Step 4: Test Core Functionality

### 1. User Registration & Login
```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'

# Login user
curl -X POST http://localhost:8080/api/auth/login-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Admin Login (OTP-based)
```bash
# Request admin OTP
curl -X POST http://localhost:8080/api/auth/login-admin-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sensesafe.com"
  }'

# Check email for OTP, then verify
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sensesafe.com",
    "otp": "123456"
  }'
```

### 3. Test Incident Reporting
```bash
# Create incident (requires auth token)
curl -X POST http://localhost:8080/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "FIRE",
    "description": "Building fire on Main Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "severity": "HIGH"
  }'
```

## 🔧 Step 5: Access System Interfaces

### Frontend Interfaces
- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000 (login as admin)
- **Real-time Dashboard**: Available on homepage
- **System Status**: Admin Dashboard → System Status tab

### Backend Interfaces
- **H2 Database Console**: http://localhost:8080/api/h2-console
  - JDBC URL: `jdbc:h2:mem:sensesafe`
  - Username: `sa`
  - Password: `password`

### ML Service Interface
- **Health Check**: http://localhost:5001/health
- **Fraud Detection**: http://localhost:5001/predict/fraud
- **Risk Assessment**: http://localhost:5001/predict/risk
- **Similarity Analysis**: http://localhost:5001/predict/similarity

## 🛠️ Step 6: Test Blockchain Integration

### Using Frontend Interface
1. Navigate to Admin Dashboard
2. Go to "System Status" tab
3. Click "Run Tests" in Blockchain Integration Test
4. Verify all tests pass

### Using API Directly
```bash
# Check blockchain health
curl http://localhost:8080/api/blockchain/health

# Test blockchain functions (requires admin auth)
curl -X POST http://localhost:8080/api/blockchain/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"incidentId": 1}'
```

## 📊 Step 7: Monitor System Performance

### Real-time Monitoring
- **Frontend**: System status indicators on dashboard
- **Backend**: Console logs and H2 database
- **ML Service**: Console logs and health endpoint
- **Blockchain**: Status indicators and audit trails

### Key Metrics to Watch
- **Response Times**: All services should respond within 2-3 seconds
- **ML Accuracy**: Should be above 85%
- **Blockchain Status**: Should show "Connected"
- **Database**: Should show active connections

## 🚨 Troubleshooting

### Common Issues

#### 1. ML Service Won't Start
```bash
# Check Python dependencies
pip list | grep -E "(flask|pandas|scikit-learn|numpy)"

# Reinstall if missing
pip install flask pandas scikit-learn numpy joblib
```

#### 2. Backend Database Issues
```bash
# Clear H2 database (if needed)
rm -rf backend/logs/
mvn clean install -DskipTests
```

#### 3. Frontend Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Conflicts
```bash
# Check what's running on ports
lsof -i :3000  # Frontend
lsof -i :8080  # Backend  
lsof -i :5001  # ML Service

# Kill processes if needed
kill -9 PID_NUMBER
```

### Service-Specific Logs

#### Backend Logs
```bash
tail -f backend/logs/sensesafe.log
```

#### ML Service Logs
```bash
# Check console output where ML service is running
```

#### Frontend Logs
```bash
# Check browser console (F12 → Console tab)
```

## 🔄 Step 8: Development Workflow

### Making Changes

#### Frontend Changes
- Files auto-reload with Vite
- Check browser console for errors
- Use React DevTools for debugging

#### Backend Changes
- Restart Spring Boot application
- Check console logs for errors
- Use H2 console for database inspection

#### ML Service Changes
- Restart Python application
- Test endpoints individually
- Check model loading logs

### Testing Changes
1. **Unit Tests**: Run component-specific tests
2. **Integration Tests**: Use blockchain integration test
3. **End-to-End**: Test full user workflows
4. **Performance**: Monitor response times

## 📈 Production Deployment

### Environment Configuration
```bash
# Set production environment variables
export SPRING_PROFILES_ACTIVE=production
export ML_BASE_URL=https://your-ml-service.com
export BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-key
```

### Build for Production
```bash
# Frontend production build
npm run build

# Backend production package
cd backend
mvn clean package -Pprod

# ML service production setup
cd backend/ml-service
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## ✅ Success Checklist

- [ ] All 4 services start without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] User can register and login
- [ ] Admin can login with OTP
- [ ] Incidents can be created and viewed
- [ ] ML predictions work (fraud, risk, similarity)
- [ ] Blockchain integration tests pass
- [ ] Real-time dashboard updates
- [ ] System status shows all green
- [ ] H2 database accessible
- [ ] WebSocket connections work

## 🎉 You're Ready!

Once all services are running and tests pass, you have a fully functional disaster management system with:

- **Real-time incident reporting and tracking**
- **ML-powered fraud detection and risk assessment**
- **Blockchain audit trails for transparency**
- **Emergency SOS system with geolocation**
- **Admin analytics dashboard**
- **Volunteer management system**
- **Hospital contact and emergency services**

The system is now ready for development, testing, or production use!