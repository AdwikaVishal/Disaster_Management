# SenseSafe ML Service

A Flask-based machine learning service providing fraud detection, risk assessment, and similarity analysis for the SenseSafe disaster management system.

## Features

- **Fraud Detection**: Analyzes incident reports to detect potential fraudulent submissions
- **Risk Assessment**: Evaluates incident severity and priority for emergency response
- **Similarity Analysis**: Finds similar incidents to detect duplicates and patterns
- **Health Monitoring**: Service health check and status endpoints

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Service
```bash
python app.py
```

The service will start on `http://localhost:5000`

### 3. Test the Service
```bash
# Health check
curl http://localhost:5000/health

# Fraud detection
curl -X POST http://localhost:5000/predict/fraud \
  -H "Content-Type: application/json" \
  -d '{"incident_type":"fire","description_length":50,"has_media":1,"upvotes":5,"flags":0}'

# Risk assessment
curl -X POST http://localhost:5000/predict/risk \
  -H "Content-Type: application/json" \
  -d '{"incident_type":"fire","severity":"high","injuries_reported":2,"people_involved":10}'
```

## API Endpoints

### Health Check
```
GET /health
```

### Fraud Detection
```
POST /predict/fraud
Content-Type: application/json

{
  "incident_type": "fire",
  "description_length": 50,
  "has_media": 1,
  "upvotes": 5,
  "flags": 0,
  "account_age_days": 100,
  "total_reports_by_user": 3,
  "verified_user": 1
}
```

### Risk Assessment
```
POST /predict/risk
Content-Type: application/json

{
  "incident_type": "fire",
  "severity": "high",
  "injuries_reported": 2,
  "people_involved": 10,
  "near_sensitive_location": 1
}
```

### Similarity Analysis
```
POST /predict/similarity
Content-Type: application/json

{
  "incident_type": "fire",
  "has_media": 1,
  "injuries_reported": 0,
  "people_involved": 5
}
```

## Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## Environment Variables

- `PORT`: Service port (default: 5000)
- `DEBUG`: Enable debug mode (default: False)

## Integration with Java Backend

The Java Spring Boot backend automatically connects to this service. Configure the ML service URL in the backend:

```yaml
ml:
  base-url: http://localhost:5000
```

The backend includes fallback algorithms if this service is unavailable.