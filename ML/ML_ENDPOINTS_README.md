# ML Endpoints Documentation

This directory contains three separate Python endpoints for serving machine learning models:

## Endpoints Overview

### 1. Fraud Detection Endpoint (`fraud_endpoint.py`)
- **Model**: `fraud_detector.pkl`
- **Purpose**: Detect fraudulent incident reports
- **Output**: Fraud probability, binary classification, confidence score
- **Key Features**: Input validation, batch prediction, feature importance

### 2. Risk Priority Endpoint (`risk_endpoint.py`)
- **Model**: `risk_priority_model.pkl`
- **Purpose**: Assess incident risk priority for emergency response
- **Output**: Risk score (0-100), risk level (low/medium/high/critical), confidence
- **Key Features**: Risk level categorization, batch prediction, risk distribution analysis

### 3. Similarity Analysis Endpoint (`similarity_endpoint.py`)
- **Data Source**: `synthetic_incidents.csv`
- **Purpose**: Find similar incidents and detect potential duplicates
- **Output**: Similar incidents, similarity scores, duplicate candidates
- **Key Features**: Cosine similarity, duplicate detection, similarity matrix calculation

## Quick Start

### Individual Endpoint Usage

```python
# Fraud Detection
from fraud_endpoint import predict_fraud

fraud_data = {
    "incident_type": "fire",
    "description_length": 50,
    "has_media": 1,
    "upvotes": 2,
    "flags": 0,
    "duplicate_score": 0.1,
    "similarity_to_previous": 0.2,
    "posted_at_night": 0,
    "account_age_days": 100,
    "total_reports_by_user": 5,
    "past_fraud_reports": 0,
    "user_total_flags": 2,
    "verified_user": 1
}

result = predict_fraud(fraud_data)
print(f"Fraud probability: {result['fraud_probability']}")
```

```python
# Risk Priority Assessment
from risk_endpoint import predict_risk

risk_data = {
    "incident_type": "road_accident",
    "description_length": 60,
    "has_media": 1,
    "upvotes": 5,
    "flags": 0,
    "duplicate_score": 0.1,
    "injuries_reported": 2,
    "people_involved": 3,
    "distance_to_responder": 2.5,
    "near_sensitive_location": 1,
    "time_of_day": "night"
}

result = predict_risk(risk_data)
print(f"Risk score: {result['risk_score']}, Level: {result['risk_level']}")
```

```python
# Similarity Analysis
from similarity_endpoint import find_similar

similarity_data = {
    "incident_type": "fire",
    "time_of_day": "evening",
    "has_media": 1,
    "upvotes": 3,
    "flags": 0,
    "injuries_reported": 0,
    "people_involved": 2,
    "distance_to_responder": 5.0,
    "near_sensitive_location": 0
}

result = find_similar(similarity_data, top_k=5)
print(f"Found {len(result['similar_incidents'])} similar incidents")
```

### Comprehensive Analysis

```python
from endpoint_usage_example import analyze_incident_comprehensive

# Complete incident data with all required features
incident = {
    "incident_type": "road_accident",
    "description_length": 85,
    "has_media": 1,
    "upvotes": 4,
    "flags": 0,
    "duplicate_score": 0.15,
    "similarity_to_previous": 0.25,
    "posted_at_night": 1,
    "account_age_days": 45,
    "total_reports_by_user": 3,
    "past_fraud_reports": 0,
    "user_total_flags": 1,
    "verified_user": 1,
    "injuries_reported": 2,
    "people_involved": 3,
    "distance_to_responder": 2.5,
    "near_sensitive_location": 1,
    "time_of_day": "night"
}

analysis = analyze_incident_comprehensive(incident)
```

## Required Features

### Fraud Detection Model
- `incident_type`: Type of incident (fire, flood, violence, etc.)
- `description_length`: Length of incident description
- `has_media`: Whether incident has media attachments (0/1)
- `upvotes`: Number of upvotes
- `flags`: Number of flags/reports
- `duplicate_score`: Similarity to existing reports (0-1)
- `similarity_to_previous`: Similarity to user's previous reports (0-1)
- `posted_at_night`: Whether posted at night (0/1)
- `account_age_days`: Age of reporting account in days
- `total_reports_by_user`: Total reports by this user
- `past_fraud_reports`: Number of past fraud reports by user
- `user_total_flags`: Total flags received by user
- `verified_user`: Whether user is verified (0/1)

### Risk Priority Model
- `incident_type`: Type of incident
- `description_length`: Length of description
- `has_media`: Media attachments (0/1)
- `upvotes`: Number of upvotes
- `flags`: Number of flags
- `duplicate_score`: Duplicate similarity (0-1)
- `injuries_reported`: Number of injuries
- `people_involved`: Number of people involved
- `distance_to_responder`: Distance to nearest responder
- `near_sensitive_location`: Near sensitive location (0/1)
- `time_of_day`: Time period (morning/afternoon/evening/night)

### Similarity Analysis
- `incident_type`: Type of incident
- `time_of_day`: Time period
- `has_media`: Media attachments (0/1)
- `upvotes`: Number of upvotes
- `flags`: Number of flags
- `injuries_reported`: Number of injuries
- `people_involved`: Number of people involved
- `distance_to_responder`: Distance to responder
- `near_sensitive_location`: Near sensitive location (0/1)

## Valid Values

### Incident Types
- `fire`
- `flood`
- `violence`
- `road_accident`
- `gas_leak`
- `power_outage`
- `infrastructure_failure`

### Time of Day
- `morning`
- `afternoon`
- `evening`
- `night`

## API Response Formats

### Fraud Detection Response
```json
{
    "success": true,
    "fraud_probability": 0.123,
    "is_fraud": false,
    "confidence": 0.856,
    "error": null
}
```

### Risk Priority Response
```json
{
    "success": true,
    "risk_score": 75.5,
    "risk_level": "high",
    "confidence": 0.92,
    "error": null
}
```

### Similarity Analysis Response
```json
{
    "success": true,
    "similar_incidents": [...],
    "similarity_scores": [0.95, 0.87, 0.82],
    "top_match_score": 0.95,
    "error": null
}
```

## Health Checks

Each endpoint provides a health check method:

```python
from fraud_endpoint import FraudDetectionEndpoint

endpoint = FraudDetectionEndpoint()
health = endpoint.health_check()
print(health["status"])  # "healthy" or "unhealthy"
```

## Error Handling

All endpoints include comprehensive error handling:
- Input validation with detailed error messages
- Model loading error handling
- Prediction error handling
- Graceful degradation when models are unavailable

## Testing

Run the individual endpoint tests:
```bash
python fraud_endpoint.py
python risk_endpoint.py
python similarity_endpoint.py
```

Run the comprehensive example:
```bash
python endpoint_usage_example.py
```

## Backend Integration

These endpoints are designed for easy integration with web frameworks:

### Flask Example
```python
from flask import Flask, request, jsonify
from fraud_endpoint import predict_fraud

app = Flask(__name__)

@app.route('/predict/fraud', methods=['POST'])
def fraud_prediction():
    data = request.json
    result = predict_fraud(data)
    return jsonify(result)
```

### FastAPI Example
```python
from fastapi import FastAPI
from fraud_endpoint import predict_fraud

app = FastAPI()

@app.post("/predict/fraud")
async def fraud_prediction(data: dict):
    result = predict_fraud(data)
    return result
```

## Dependencies

- pandas
- numpy
- scikit-learn
- joblib

Install with:
```bash
pip install pandas numpy scikit-learn joblib
```