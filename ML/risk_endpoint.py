"""
Risk Priority Endpoint

Serves the risk priority model with validation and error handling.
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
class RiskPredictionResult:
    """Risk prediction result format"""
    success: bool
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    confidence: Optional[float] = None
    error: Optional[str] = None
    model_version: str = "risk_v1.0"


class RiskPriorityEndpoint:
    """Endpoint for risk priority model"""
    
    def __init__(self, model_path: str = "risk_priority_model.pkl"):
        """
        Initialize the risk priority endpoint
        
        Args:
            model_path: Path to the risk priority model
        """
        self.model_path = model_path
        self.model = None
        self._load_model()
        
        # Define expected features
        self.required_features = [
            "incident_type", "description_length", "has_media", "upvotes", 
            "flags", "duplicate_score", "injuries_reported", "people_involved", 
            "distance_to_responder", "near_sensitive_location", "time_of_day"
        ]
        
        # Valid categorical values
        self.valid_incident_types = [
            "fire", "flood", "violence", "road_accident", "gas_leak", 
            "power_outage", "infrastructure_failure"
        ]
        
        self.valid_time_of_day = ["morning", "afternoon", "evening", "night"]
        
        # Risk level thresholds
        self.risk_thresholds = {
            "low": (0, 30),
            "medium": (30, 60),
            "high": (60, 80),
            "critical": (80, 100)
        }
    
    def _load_model(self) -> None:
        """Load the risk priority model"""
        try:
            if Path(self.model_path).exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded risk model from {self.model_path}")
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
        
        # Validate time_of_day
        if data.get("time_of_day") not in self.valid_time_of_day:
            return f"Invalid time_of_day. Must be one of: {self.valid_time_of_day}"
        
        # Validate numeric ranges and types
        validations = {
            "description_length": {"type": (int, float), "min": 0, "max": 1000},
            "has_media": {"type": (int, float), "min": 0, "max": 1},
            "upvotes": {"type": (int, float), "min": 0},
            "flags": {"type": (int, float), "min": 0},
            "duplicate_score": {"type": (int, float), "min": 0, "max": 1},
            "injuries_reported": {"type": (int, float), "min": 0},
            "people_involved": {"type": (int, float), "min": 1},
            "distance_to_responder": {"type": (int, float), "min": 0},
            "near_sensitive_location": {"type": (int, float), "min": 0, "max": 1}
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
    
    def _get_risk_level(self, score: float) -> str:
        """
        Convert risk score to risk level
        
        Args:
            score: Risk score
            
        Returns:
            Risk level string
        """
        for level, (min_score, max_score) in self.risk_thresholds.items():
            if min_score <= score < max_score:
                return level
        return "critical"  # For scores >= 80
    
    def predict(self, data: Dict[str, Any]) -> RiskPredictionResult:
        """
        Predict risk priority score for an incident
        
        Args:
            data: Dictionary containing incident features
            
        Returns:
            RiskPredictionResult with prediction details
        """
        if self.model is None:
            return RiskPredictionResult(
                success=False,
                error="Model not loaded"
            )
        
        # Validate input
        validation_error = self._validate_input(data)
        if validation_error:
            return RiskPredictionResult(
                success=False,
                error=validation_error
            )
        
        try:
            # Create DataFrame with proper feature order
            df = pd.DataFrame([{feature: data[feature] for feature in self.required_features}])
            
            # Get prediction
            risk_score = float(self.model.predict(df)[0])
            
            # Ensure score is within reasonable bounds
            risk_score = max(0, min(100, risk_score))
            
            # Get risk level
            risk_level = self._get_risk_level(risk_score)
            
            # Calculate confidence based on score magnitude and features
            # Higher scores and certain features (injuries, sensitive locations) increase confidence
            base_confidence = min(risk_score / 100.0, 1.0) if risk_score > 0 else 0.1
            
            # Boost confidence for high-risk indicators
            confidence_boost = 0
            if data.get("injuries_reported", 0) > 0:
                confidence_boost += 0.1
            if data.get("near_sensitive_location", 0) == 1:
                confidence_boost += 0.1
            if data.get("people_involved", 1) > 3:
                confidence_boost += 0.05
            
            confidence = min(base_confidence + confidence_boost, 1.0)
            
            return RiskPredictionResult(
                success=True,
                risk_score=risk_score,
                risk_level=risk_level,
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Error in risk prediction: {str(e)}")
            return RiskPredictionResult(
                success=False,
                error=f"Prediction error: {str(e)}"
            )
    
    def predict_batch(self, data_list: List[Dict[str, Any]]) -> List[RiskPredictionResult]:
        """
        Predict risk priority for multiple incidents
        
        Args:
            data_list: List of incident data dictionaries
            
        Returns:
            List of RiskPredictionResult objects
        """
        return [self.predict(data) for data in data_list]
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance from the model (if available)
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if self.model is None:
            return {}
        
        try:
            # Try to get feature importance from the regressor
            if hasattr(self.model.named_steps['rf'], 'feature_importances_'):
                importances = self.model.named_steps['rf'].feature_importances_
                
                # Get feature names after preprocessing
                feature_names = self.model.named_steps['prep'].get_feature_names_out()
                
                return dict(zip(feature_names, importances))
        except Exception as e:
            logger.warning(f"Could not extract feature importance: {str(e)}")
        
        return {}
    
    def get_risk_distribution(self, data_list: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Get distribution of risk levels for a batch of incidents
        
        Args:
            data_list: List of incident data dictionaries
            
        Returns:
            Dictionary with count of each risk level
        """
        results = self.predict_batch(data_list)
        distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        
        for result in results:
            if result.success and result.risk_level:
                distribution[result.risk_level] += 1
        
        return distribution
    
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
            "valid_time_of_day": self.valid_time_of_day,
            "risk_thresholds": self.risk_thresholds,
            "timestamp": pd.Timestamp.now().isoformat()
        }


# Convenience functions for easy integration
def predict_risk(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simple risk prediction function
    
    Args:
        data: Incident data dictionary
        
    Returns:
        Dictionary with prediction results
    """
    endpoint = RiskPriorityEndpoint()
    result = endpoint.predict(data)
    
    return {
        "success": result.success,
        "risk_score": result.risk_score,
        "risk_level": result.risk_level,
        "confidence": result.confidence,
        "error": result.error
    }


if __name__ == "__main__":
    # Test the endpoint
    endpoint = RiskPriorityEndpoint()
    
    # Test samples
    test_samples = [
        # High-risk accident
        {
            "incident_type": "road_accident",
            "description_length": 60,
            "has_media": 1,
            "upvotes": 5,
            "flags": 0,
            "duplicate_score": 0.1,
            "injuries_reported": 1,
            "people_involved": 3,
            "distance_to_responder": 4.2,
            "near_sensitive_location": 1,
            "time_of_day": "night"
        },
        # Medium-risk fire
        {
            "incident_type": "fire",
            "description_length": 40,
            "has_media": 0,
            "upvotes": 1,
            "flags": 0,
            "duplicate_score": 0.2,
            "injuries_reported": 0,
            "people_involved": 1,
            "distance_to_responder": 10,
            "near_sensitive_location": 0,
            "time_of_day": "afternoon"
        }
    ]
    
    print("=== Risk Priority Endpoint Test ===")
    for i, test_data in enumerate(test_samples, 1):
        print(f"\n--- Test Sample {i} ---")
        result = endpoint.predict(test_data)
        
        if result.success:
            print(f"Risk Score: {result.risk_score:.2f}")
            print(f"Risk Level: {result.risk_level}")
            print(f"Confidence: {result.confidence:.3f}")
        else:
            print(f"Error: {result.error}")
    
    # Health check
    print("\n=== Health Check ===")
    health = endpoint.health_check()
    print(f"Status: {health['status']}")
    print(f"Model Loaded: {health['model_loaded']}")
    
    # Risk distribution
    print("\n=== Risk Distribution ===")
    distribution = endpoint.get_risk_distribution(test_samples)
    for level, count in distribution.items():
        print(f"{level.capitalize()}: {count}")