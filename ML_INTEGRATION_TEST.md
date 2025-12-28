# ML Integration Test Guide

## Overview
This guide tests the complete ML integration across the SenseSafe system, ensuring all ML models are properly linked between backend and frontend.

## Prerequisites
1. Backend server running on `http://localhost:8080`
2. ML service running on `http://localhost:5000`
3. Frontend running on `http://localhost:3000` or `http://localhost:5173`

## ML Service Startup

### Start ML Service
```bash
cd backend/ml-service
python app.py
```

Expected output:
```
INFO:__main__:ML models initialized successfully
INFO:__main__:Starting SenseSafe ML Service on port 5000
```

### Test ML Service Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "SenseSafe ML Service",
  "models_loaded": true
}
```

## Backend ML Integration Tests

### 1. Test ML Health Check Endpoint
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/incidents/ml-health
```

Expected response:
```json
{
  "success": true,
  "mlServiceAvailable": true,
  "status": "healthy",
  "fallbackMode": false,
  "timestamp": "2024-01-01T12:00:00"
}
```

### 2. Test Fraud Detection
```bash
curl -X POST http://localhost:5000/predict/fraud \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "fire",
    "description_length": 50,
    "has_media": 1,
    "upvotes": 5,
    "flags": 0,
    "account_age_days": 100,
    "total_reports_by_user": 3,
    "verified_user": 1
  }'
```

### 3. Test Risk Assessment
```bash
curl -X POST http://localhost:5000/predict/risk \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "fire",
    "severity": "high",
    "injuries_reported": 2,
    "people_involved": 5,
    "near_sensitive_location": 1
  }'
```

### 4. Test Similarity Analysis
```bash
curl -X POST http://localhost:5000/predict/similarity \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "fire",
    "has_media": 1,
    "injuries_reported": 1,
    "people_involved": 3
  }'
```

### 5. Test Enhanced Severity Suggestion
```bash
curl -X POST http://localhost:8080/api/incidents/suggest-severity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ROAD_ACCIDENT",
    "description": "Multi-vehicle collision with injuries",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "hasInjuries": true,
    "hasBleeding": true,
    "vehiclesInvolved": 3,
    "isRoadBlocked": true
  }'
```

### 6. Test Emergency Service Recommendations
```bash
curl -X POST http://localhost:8080/api/incidents/emergency-recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ROAD_ACCIDENT",
    "description": "Serious accident with unconscious victims",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "hasInjuries": true,
    "hasUnconsciousPeople": true,
    "vehiclesInvolved": 2,
    "hasFireRisk": false
  }'
```

## Frontend ML Integration Tests

### 1. ML Status Indicator
- Navigate to Admin Dashboard → Analytics tab
- Verify ML Status Indicator shows "Active" status
- Check that ML service health is displayed correctly

### 2. Incident Report Form ML Features
- Navigate to incident reporting form
- Select "Road Accident" as incident type
- Fill in guided questions (injuries, vehicles, etc.)
- Verify ML severity suggestions appear in real-time
- Verify emergency service recommendations are displayed

### 3. Analytics Dashboard ML Metrics
- Navigate to Admin Analytics Dashboard
- Verify "ML Accuracy" metric is displayed
- Check "Duplicate Detection" shows ML-powered results
- Confirm real-time updates work with WebSocket

### 4. Real-Time Dashboard ML Integration
- Navigate to Home Page → Dashboard tab
- Verify ML-powered risk scores are displayed
- Check fraud detection indicators on incidents
- Confirm similarity analysis results are shown

## Expected ML Integration Points

### ✅ Incident Creation Flow
1. User fills incident report form
2. Frontend sends data to `/incidents/suggest-severity`
3. Backend calls MLAnalysisService.suggestSeverity()
4. MLAnalysisService calls ML service `/predict/risk`
5. ML service returns risk analysis
6. Backend processes and returns severity suggestion
7. Frontend displays ML-powered severity recommendation

### ✅ Emergency Service Recommendations
1. User answers guided questions
2. Frontend sends data to `/incidents/emergency-recommendations`
3. Backend calls MLAnalysisService.recommendEmergencyServices()
4. ML analysis determines service needs
5. Backend returns recommendations with explanations
6. Frontend displays service recommendations with urgency

### ✅ Incident Processing (Backend)
1. Incident created via IncidentService.createIncident()
2. MLAnalysisService.performComprehensiveAnalysis() called
3. Fraud, risk, and similarity analyses performed
4. Results stored in incident record
5. WebSocket broadcasts ML-enhanced incident data
6. Frontend receives real-time ML insights

### ✅ Analytics Dashboard
1. Admin requests analytics via `/incidents/analytics`
2. IncidentService.getAnalytics() processes ML-enhanced data
3. ML accuracy and duplicate detection metrics calculated
4. Frontend displays comprehensive ML-powered analytics
5. Real-time updates via WebSocket integration

## Fallback Mode Testing

### Test ML Service Unavailable
1. Stop ML service: `Ctrl+C` in ML service terminal
2. Test backend endpoints - should return fallback results
3. Check frontend shows "Fallback Mode" in ML Status Indicator
4. Verify system continues to function with rule-based analysis

### Test ML Service Recovery
1. Restart ML service: `python app.py`
2. Wait 30 seconds for health check
3. Verify ML Status Indicator shows "Active" again
4. Test ML endpoints return ML-powered results

## Performance Verification

### ML Response Times
- Fraud detection: < 200ms
- Risk assessment: < 200ms
- Similarity analysis: < 300ms
- Severity suggestion: < 500ms
- Emergency recommendations: < 500ms

### Frontend Integration
- Real-time ML suggestions: < 1 second
- Analytics dashboard load: < 2 seconds
- ML status updates: Every 30 seconds
- WebSocket ML updates: Immediate

## Troubleshooting

### ML Service Issues
```bash
# Check ML service logs
tail -f backend/ml-service/app.log

# Test ML service directly
curl http://localhost:5000/health
```

### Backend ML Integration Issues
```bash
# Check backend logs
tail -f backend/logs/sensesafe.log

# Test ML health endpoint
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/incidents/ml-health
```

### Frontend ML Integration Issues
- Open browser developer tools
- Check Network tab for ML API calls
- Verify WebSocket connections in Console
- Check ML Status Indicator component

## Success Criteria

### ✅ All ML Models Connected
- [x] Fraud detection integrated and working
- [x] Risk assessment integrated and working  
- [x] Similarity analysis integrated and working
- [x] Severity suggestions using ML
- [x] Emergency service recommendations using ML

### ✅ Real-Time ML Integration
- [x] WebSocket broadcasts ML results
- [x] Frontend receives real-time ML updates
- [x] ML status monitoring active
- [x] Fallback mode functional

### ✅ User Experience
- [x] ML suggestions appear in incident forms
- [x] Emergency recommendations display correctly
- [x] Analytics show ML-powered insights
- [x] ML status visible to administrators

### ✅ System Reliability
- [x] Graceful fallback when ML unavailable
- [x] Automatic ML service recovery detection
- [x] Error handling for ML failures
- [x] Performance within acceptable limits

## Conclusion

The ML integration is fully operational with:
- 3 core ML models (fraud, risk, similarity)
- Enhanced severity suggestions
- ML-powered emergency service recommendations
- Real-time ML status monitoring
- Comprehensive fallback mechanisms
- Full frontend-backend ML integration
- WebSocket-based real-time ML updates

All ML models are properly linked throughout the system and provide intelligent insights to enhance emergency response capabilities.