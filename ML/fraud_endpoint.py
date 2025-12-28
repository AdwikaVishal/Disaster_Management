"""
Fraud Detection Endpoint

Serves the fraud detection model with validation and error handling.
"""

import joblib
import pandas as pd
import numpy as np
from typing import Dict, List, Union, Optional, Any
from dataclasses import dataclass
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class FraudPredictionResult:
    """Fraud prediction result format"""
    success: bool
    fraud_probability: Optional[float] = None
    is_fraud: Optional[bool] = None
    confidence: Optional[float] = None
    error: Optional[str] = None
    model_version: str = "fraud_v1.0"


class FraudDetectionEndpoint:
    """Endpoint for fraud detection model"""
    
    def __init__(self, model_path: str = "fraud_detector.pkl"):
        """
        Initialize the fraud detection endpoint
        
        Args:
            model_path: Path to the fraud detection model
        """
        self.model_path = model_path
        self.model = None
        self._load_model()
        
        # Define expected features
        self.required_features = [
            "incident_type", "description_length", "has_media", "upvotes", 
            "flags", "duplicate_score", "similarity_to_previous", 
            "posted_at_night", "account_age_days", "total_reports_by_user", 
            "past_fraud_reports", "user_total_flags", "verified_user"
        ]
        
        # Valid categorical values
        self.valid_incident_types = [
            "fire", "flood", "violence", "road_accident", "gas_leak", 
            "power_outage", "infrastructure_failure"
        ]
    
    def _load_model(self) -> None:
        """Load the fraud detection model"""
        try:
            if Path(self.model_path).exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded fraud model from {self.model_path}")
            else:
                logger.error(f"Model file not found: {self.model_path}")
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def _validate_input(self, data: Dict[str, Any]) -> Optional[str]:
        """
        Validate input data
        
        Args:
            data: Input data dictionary
            
        Returns:
            Error message if validation fails, None if valid
        """
        # Check for missing features
        missing_features = [f for f in self.required_features if f not in data]
        if missing_features:
            return f"Missing required features: {missing_features}"
        
        # Validate incident_type
        if data.get("incident_type") not in self.valid_incident_types:
            return f"Invalid incident_type. Must be one of: {self.valid_incident_types}"
        
        # Validate numeric ranges and types
        validations = {
            "description_length": {"type": (int, float), "min": 0, "max": 1000},
            "has_media": {"type": (int, float), "min": 0, "max": 1},
            "upvotes": {"type": (int, float), "min": 0},
            "flags": {"type": (int, float), "min": 0},
            "duplicate_score": {"type": (int, float), "min": 0, "max": 1},
            "similarity_to_previous": {"type": (int, float), "min": 0, "max": 1},
            "posted_at_night": {"type": (int, float), "min": 0, "max": 1},
            "account_age_days": {"type": (int, float), "min": 0},
            "total_reports_by_user": {"type": (int, float), "min": 0},
            "past_fraud_reports": {"type": (int, float), "min": 0},
            "user_total_flags": {"type": (int, float), "min": 0},
            "verified_user": {"type": (int, float), "min": 0, "max": 1}
        }
        
        for field, rules in validations.items():
            if field in data:
                value = data[field]
                
                # Type check
                if not isinstance(value, rules["type"]):
                    return f"{field} must be numeric"
                
                # Range checks
                if "min" in rules and value < rules["min"]:
                    return f"{field} must be >= {rules['min']}"
                if "max" in rules and value > rules["max"]:
                    return f"{field} must be <= {rules['max']}"
        
        return None
    
    def predict(self, data: Dict[str, Any], threshold: float = 0.5) -> FraudPredictionResult:
        """
        Predict fraud probability for an incident
        
        Args:
            data: Dictionary containing incident features
            threshold: Threshold for binary classification (default: 0.5)
            
        Returns:
            FraudPredictionResult with prediction details
        """
        if self.model is None:
            return FraudPredictionResult(
                success=False,
                error="Model not loaded"
            )
        
        # Validate input
        validation_error = self._validate_input(data)
        if validation_error:
            return FraudPredictionResult(
                success=False,
                error=validation_error
            )
        
        try:
            # Create DataFrame with proper feature order
            df = pd.DataFrame([{feature: data[feature] for feature in self.required_features}])
            
            # Get prediction probabilities
            probabilities = self.model.predict_proba(df)[0]
            fraud_probability = float(probabilities[1])  # Probability of fraud (class 1)
            
            # Binary classification
            is_fraud = fraud_probability >= threshold
            
            # Calculate confidence (distance from threshold)
            confidence = abs(fraud_probability - threshold) / max(threshold, 1 - threshold)
            confidence = min(confidence, 1.0)
            
            return FraudPredictionResult(
                success=True,
                fraud_probability=fraud_probability,
                is_fraud=is_fraud,
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Error in fraud prediction: {str(e)}")
            return FraudPredictionResult(
                success=False,
                error=f"Prediction error: {str(e)}"
            )
    
    def predict_batch(self, data_list: List[Dict[str, Any]], threshold: float = 0.5) -> List[FraudPredictionResult]:
        """
        Predict fraud for multiple incidents
        
        Args:
            data_list: List of incident data dictionaries
            threshold: Threshold for binary classification
            
        Returns:
            List of FraudPredictionResult objects
        """
        return [self.predict(data, threshold) for data in data_list]
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance from the model (if available)
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if self.model is None:
            return {}
        
        try:
            # Try to get feature importance from the classifier
            if hasattr(self.model.named_steps['clf'], 'feature_importances_'):
                importances = self.model.named_steps['clf'].feature_importances_
                
                # Get feature names after preprocessing
                feature_names = self.model.named_steps['prep'].get_feature_names_out()
                
                return dict(zip(feature_names, importances))
        except Exception as e:
            logger.warning(f"Could not extract feature importance: {str(e)}")
        
        return {}
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on the endpoint
        
        Returns:
            Health status dictionary
        """
        return {
            "status": "healthy" if self.model is not None else "unhealthy",
            "model_loaded": self.model is not None,
            "model_path": self.model_path,
            "required_features": self.required_features,
            "valid_incident_types": self.valid_incident_types,
            "timestamp": pd.Timestamp.now().isoformat()
        }


# Convenience functions for easy integration
def predict_fraud(data: Dict[str, Any], threshold: float = 0.5) -> Dict[str, Any]:
    """
    Simple fraud prediction function
    
    Args:
        data: Incident data dictionary
        threshold: Classification threshold
        
    Returns:
        Dictionary with prediction results
    """
    endpoint = FraudDetectionEndpoint()
    result = endpoint.predict(data, threshold)
    
    return {
        "success": result.success,
        "fraud_probability": result.fraud_probability,
        "is_fraud": result.is_fraud,
        "confidence": result.confidence,
        "error": result.error
    }


if __name__ == "__main__":
    # Test the endpoint
    endpoint = FraudDetectionEndpoint()
    
    # Test sample
    test_data = {
        "incident_type": "fire",
        "description_length": 8,
        "has_media": 0,
        "upvotes": 0,
        "flags": 4,
        "duplicate_score": 0.85,
        "similarity_to_previous": 0.92,
        "posted_at_night": 1,
        "account_age_days": 3,
        "total_reports_by_user": 18,
        "past_fraud_reports": 2,
        "user_total_flags": 10,
        "verified_user": 0
    }
    
    print("=== Fraud Detection Endpoint Test ===")
    result = endpoint.predict(test_data)
    
    if result.success:
        print(f"Fraud Probability: {result.fraud_probability:.3f}")
        print(f"Is Fraud: {result.is_fraud}")
        print(f"Confidence: {result.confidence:.3f}")
    else:
        print(f"Error: {result.error}")
    
    # Health check
    print("\n=== Health Check ===")
    health = endpoint.health_check()
    print(f"Status: {health['status']}")
    print(f"Model Loaded: {health['model_loaded']}")