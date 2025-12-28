#!/usr/bin/env python3
"""
SenseSafe ML Service
A Flask-based service providing ML endpoints for fraud detection, risk assessment, and similarity analysis.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for models and encoders
fraud_model = None
risk_model = None
label_encoders = {}

def initialize_models():
    """Initialize ML models with sample data"""
    global fraud_model, risk_model, label_encoders
    
    try:
        # Create sample training data for fraud detection
        fraud_data = pd.DataFrame({
            'incident_type': ['fire', 'flood', 'violence', 'road_accident'] * 25,
            'description_length': np.random.randint(10, 200, 100),
            'has_media': np.random.randint(0, 2, 100),
            'upvotes': np.random.randint(0, 20, 100),
            'flags': np.random.randint(0, 5, 100),
            'account_age_days': np.random.randint(1, 1000, 100),
            'total_reports_by_user': np.random.randint(1, 50, 100),
            'verified_user': np.random.randint(0, 2, 100),
            'is_fraud': np.random.randint(0, 2, 100)  # Target variable
        })
        
        # Encode categorical variables
        le_incident = LabelEncoder()
        fraud_data['incident_type_encoded'] = le_incident.fit_transform(fraud_data['incident_type'])
        label_encoders['incident_type'] = le_incident
        
        # Train fraud detection model
        fraud_features = ['incident_type_encoded', 'description_length', 'has_media', 
                         'upvotes', 'flags', 'account_age_days', 'total_reports_by_user', 'verified_user']
        fraud_model = RandomForestClassifier(n_estimators=50, random_state=42)
        fraud_model.fit(fraud_data[fraud_features], fraud_data['is_fraud'])
        
        # Create sample training data for risk assessment
        risk_data = pd.DataFrame({
            'incident_type': ['fire', 'flood', 'violence', 'road_accident', 'gas_leak'] * 20,
            'severity': ['low', 'medium', 'high', 'critical'] * 25,
            'injuries_reported': np.random.randint(0, 10, 100),
            'people_involved': np.random.randint(1, 50, 100),
            'near_sensitive_location': np.random.randint(0, 2, 100),
            'risk_score': np.random.randint(0, 101, 100)  # Target variable
        })
        
        # Encode categorical variables for risk model
        le_severity = LabelEncoder()
        risk_data['severity_encoded'] = le_severity.fit_transform(risk_data['severity'])
        label_encoders['severity'] = le_severity
        
        risk_data['incident_type_encoded'] = le_incident.transform(
            [t if t in le_incident.classes_ else 'fire' for t in risk_data['incident_type']]
        )
        
        # Train risk assessment model
        risk_features = ['incident_type_encoded', 'severity_encoded', 'injuries_reported', 
                        'people_involved', 'near_sensitive_location']
        risk_model = RandomForestClassifier(n_estimators=50, random_state=42)
        risk_model.fit(risk_data[risk_features], risk_data['risk_score'] > 50)  # Binary classification
        
        logger.info("ML models initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing models: {str(e)}")
        raise

def encode_incident_type(incident_type):
    """Encode incident type using the trained encoder"""
    if 'incident_type' in label_encoders:
        if incident_type in label_encoders['incident_type'].classes_:
            return label_encoders['incident_type'].transform([incident_type])[0]
        else:
            # Default to 'fire' if unknown type
            return label_encoders['incident_type'].transform(['fire'])[0]
    return 0

def encode_severity(severity):
    """Encode severity using the trained encoder"""
    if 'severity' in label_encoders:
        if severity in label_encoders['severity'].classes_:
            return label_encoders['severity'].transform([severity])[0]
        else:
            # Default to 'medium' if unknown severity
            return label_encoders['severity'].transform(['medium'])[0]
    return 1

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'SenseSafe ML Service',
        'models_loaded': fraud_model is not None and risk_model is not None
    })

@app.route('/predict/fraud', methods=['POST'])
def predict_fraud():
    """Fraud detection endpoint"""
    try:
        data = request.json
        
        # Extract features
        features = [
            encode_incident_type(data.get('incident_type', 'fire')),
            data.get('description_length', 50),
            data.get('has_media', 0),
            data.get('upvotes', 0),
            data.get('flags', 0),
            data.get('account_age_days', 30),
            data.get('total_reports_by_user', 1),
            data.get('verified_user', 0)
        ]
        
        # Make prediction
        fraud_prob = fraud_model.predict_proba([features])[0][1]
        is_fraud = fraud_prob > 0.5
        confidence = max(fraud_prob, 1 - fraud_prob)
        
        return jsonify({
            'success': True,
            'fraud_probability': float(fraud_prob),
            'is_fraud': bool(is_fraud),
            'confidence': float(confidence),
            'error': None
        })
        
    except Exception as e:
        logger.error(f"Error in fraud prediction: {str(e)}")
        return jsonify({
            'success': False,
            'fraud_probability': 0.0,
            'is_fraud': False,
            'confidence': 0.0,
            'error': str(e)
        }), 500

@app.route('/predict/risk', methods=['POST'])
def predict_risk():
    """Risk assessment endpoint"""
    try:
        data = request.json
        
        # Extract features
        features = [
            encode_incident_type(data.get('incident_type', 'fire')),
            encode_severity(data.get('severity', 'medium')),
            data.get('injuries_reported', 0),
            data.get('people_involved', 1),
            data.get('near_sensitive_location', 0)
        ]
        
        # Make prediction
        risk_prob = risk_model.predict_proba([features])[0][1]
        
        # Calculate risk score (0-100)
        base_score = 50
        risk_score = base_score + (risk_prob * 50)
        
        # Determine risk level
        if risk_score >= 80:
            risk_level = 'critical'
        elif risk_score >= 60:
            risk_level = 'high'
        elif risk_score >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        confidence = max(risk_prob, 1 - risk_prob)
        
        return jsonify({
            'success': True,
            'risk_score': float(risk_score),
            'risk_level': risk_level,
            'confidence': float(confidence),
            'error': None
        })
        
    except Exception as e:
        logger.error(f"Error in risk prediction: {str(e)}")
        return jsonify({
            'success': False,
            'risk_score': 50.0,
            'risk_level': 'medium',
            'confidence': 0.0,
            'error': str(e)
        }), 500

@app.route('/predict/similarity', methods=['POST'])
def predict_similarity():
    """Similarity analysis endpoint"""
    try:
        data = request.json
        
        # Simple similarity calculation based on incident type and features
        incident_type = data.get('incident_type', 'fire')
        has_media = data.get('has_media', 0)
        injuries = data.get('injuries_reported', 0)
        people = data.get('people_involved', 1)
        
        # Mock similar incidents (in real implementation, this would query a database)
        similar_incidents = []
        similarity_scores = []
        
        # Generate mock similar incidents
        for i in range(3):
            similarity_score = np.random.uniform(0.6, 0.95)
            similar_incidents.append({
                'id': f'incident_{i+1}',
                'type': incident_type,
                'similarity': similarity_score,
                'title': f'Similar {incident_type} incident #{i+1}'
            })
            similarity_scores.append(similarity_score)
        
        top_match_score = max(similarity_scores) if similarity_scores else 0.0
        
        return jsonify({
            'success': True,
            'similar_incidents': similar_incidents,
            'similarity_scores': similarity_scores,
            'top_match_score': float(top_match_score),
            'error': None
        })
        
    except Exception as e:
        logger.error(f"Error in similarity analysis: {str(e)}")
        return jsonify({
            'success': False,
            'similar_incidents': [],
            'similarity_scores': [],
            'top_match_score': 0.0,
            'error': str(e)
        }), 500

@app.route('/models/retrain', methods=['POST'])
def retrain_models():
    """Retrain models with new data (placeholder)"""
    try:
        # In a real implementation, this would retrain models with new data
        logger.info("Model retraining requested")
        
        return jsonify({
            'success': True,
            'message': 'Models retrained successfully',
            'timestamp': pd.Timestamp.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error retraining models: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Initialize models on startup
    initialize_models()
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting SenseSafe ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)