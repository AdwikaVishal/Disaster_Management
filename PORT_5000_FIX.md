# Port 5000 Conflict Fix - macOS AirPlay Receiver

## Problem
On macOS, port 5000 is used by the AirPlay Receiver service, which prevents the ML service from starting.

## Error Message
```
Address already in use
Port 5000 is in use by another program. Either identify and stop that program, or start the server with a different port.
On macOS, try disabling the 'AirPlay Receiver' service from System Preferences -> General -> AirDrop & Handoff.
```

## ✅ Solution Applied
The system has been updated to use **port 5001** for the ML service instead of port 5000.

## Updated Configuration

### 1. ML Service (backend/ml-service/app.py)
- Now uses environment variable `PORT` with default 5001
- Start with: `PORT=5001 python app.py`

### 2. Backend Configuration (application.yml)
```yaml
ml:
  base-url: http://localhost:5001  # Changed from 5000 to 5001
```

### 3. Startup Scripts
- `start-system.sh` - Updated to use port 5001
- `stop-system.sh` - Updated to check port 5001

## How to Start ML Service Manually

### Option 1: Using Environment Variable (Recommended)
```bash
cd backend/ml-service
PORT=5001 python app.py
```

### Option 2: Disable AirPlay Receiver (Alternative)
1. Open **System Preferences** → **General** → **AirDrop & Handoff**
2. Uncheck **AirPlay Receiver**
3. Then you can use port 5000: `python app.py`

## Verification

### Check if port 5001 is available:
```bash
lsof -i :5001
```
Should return nothing if port is free.

### Test ML service health:
```bash
curl http://localhost:5001/health
```
Should return:
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

## Updated System URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080/api
- **ML Service**: http://localhost:5001 ← **Changed**
- **H2 Console**: http://localhost:8080/api/h2-console

## Quick Start Commands

### Start all services:
```bash
./start-system.sh
```

### Start ML service only:
```bash
cd backend/ml-service
PORT=5001 python app.py
```

### Stop all services:
```bash
./stop-system.sh
```

The system is now configured to avoid the macOS AirPlay Receiver port conflict!