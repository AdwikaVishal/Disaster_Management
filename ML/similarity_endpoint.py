"""
Similarity Analysis Endpoint

Provides incident similarity analysis using cosine similarity.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Union, Optional, Any, Tuple
from dataclasses import dataclass
import logging
from pathlib import Path
import joblib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class SimilarityResult:
    """Similarity analysis result format"""
    success: bool
    similar_incidents: Optional[List[Dict[str, Any]]] = None
    similarity_scores: Optional[List[float]] = None
    top_match_score: Optional[float] = None
    error: Optional[str] = None


class SimilarityEndpoint:
    """Endpoint for incident similarity analysis"""
    
    def __init__(self, data_path: str = "synthetic_incidents.csv"):
        """
        Initialize the similarity endpoint
        
        Args:
            data_path: Path to the incidents dataset
        """
        self.data_path = data_path
        self.df = None
        self.scaler = None
        self.processed_data = None
        self.feature_columns = None
        
        # Define features for similarity analysis
        self.similarity_features = [
            "incident_type", "time_of_day", "has_media", "upvotes", 
            "flags", "injuries_reported", "people_involved", 
            "distance_to_responder", "near_sensitive_location"
        ]
        
        self.numeric_features = [
            "has_media", "upvotes", "flags", "injuries_reported", 
            "people_involved", "distance_to_responder", "near_sensitive_location"
        ]
        
        # Valid categorical values
        self.valid_incident_types = [
            "fire", "flood", "violence", "road_accident", "gas_leak", 
            "power_outage", "infrastructure_failure"
        ]
        
        self.valid_time_of_day = ["morning", "afternoon", "evening", "night"]
        
        self._load_and_process_data()
    
    def _load_and_process_data(self) -> None:
        """Load and preprocess the incidents data"""
        try:
            if not Path(self.data_path).exists():
                logger.error(f"Data file not found: {self.data_path}")
                raise FileNotFoundError(f"Data file not found: {self.data_path}")
            
            # Load data
            self.df = pd.read_csv(self.data_path)
            logger.info(f"Loaded {len(self.df)} incidents from {self.data_path}")
            
            # Prepare features for similarity analysis
            X = self.df[self.similarity_features].copy()
            
            # One-hot encode categorical features
            X_encoded = pd.get_dummies(X, columns=["incident_type", "time_of_day"])
            
            # Scale numeric features
            self.scaler = MinMaxScaler()
            X_encoded[self.numeric_features] = self.scaler.fit_transform(X_encoded[self.numeric_features])
            
            # Store processed data and feature columns
            self.processed_data = X_encoded
            self.feature_columns = X_encoded.columns.tolist()
            
            logger.info("Data preprocessing completed")
            
        except Exception as e:
            logger.error(f"Error loading and processing data: {str(e)}")
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
        missing_features = [f for f in self.similarity_features if f not in data]
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
            "has_media": {"type": (int, float), "min": 0, "max": 1},
            "upvotes": {"type": (int, float), "min": 0},
            "flags": {"type": (int, float), "min": 0},
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
    
    def _preprocess_incident(self, data: Dict[str, Any]) -> pd.DataFrame:
        """
        Preprocess a single incident for similarity analysis
        
        Args:
            data: Incident data dictionary
            
        Returns:
            Preprocessed DataFrame
        """
        # Create DataFrame
        incident_df = pd.DataFrame([{feature: data[feature] for feature in self.similarity_features}])
        
        # One-hot encode
        incident_encoded = pd.get_dummies(incident_df, columns=["incident_type", "time_of_day"])
        
        # Ensure all columns are present (fill missing with 0)
        incident_encoded = incident_encoded.reindex(columns=self.feature_columns, fill_value=0)
        
        # Scale numeric features
        incident_encoded[self.numeric_features] = self.scaler.transform(incident_encoded[self.numeric_features])
        
        return incident_encoded
    
    def find_similar_incidents(self, data: Dict[str, Any], top_k: int = 10, 
                             min_similarity: float = 0.0) -> SimilarityResult:
        """
        Find similar incidents to the given incident
        
        Args:
            data: Dictionary containing incident features
            top_k: Number of top similar incidents to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            SimilarityResult with similar incidents and scores
        """
        if self.processed_data is None or self.df is None:
            return SimilarityResult(
                success=False,
                error="Data not loaded"
            )
        
        # Validate input
        validation_error = self._validate_input(data)
        if validation_error:
            return SimilarityResult(
                success=False,
                error=validation_error
            )
        
        try:
            # Preprocess the input incident
            incident_processed = self._preprocess_incident(data)
            
            # Calculate cosine similarity
            similarities = cosine_similarity(incident_processed, self.processed_data)[0]
            
            # Create results DataFrame
            results_df = self.df.copy()
            results_df["similarity_score"] = similarities
            
            # Filter by minimum similarity and sort
            filtered_results = results_df[results_df["similarity_score"] >= min_similarity]
            sorted_results = filtered_results.sort_values("similarity_score", ascending=False)
            
            # Get top K results
            top_results = sorted_results.head(top_k)
            
            # Prepare output
            similar_incidents = []
            similarity_scores = []
            
            for _, row in top_results.iterrows():
                incident_dict = row.drop("similarity_score").to_dict()
                similar_incidents.append(incident_dict)
                similarity_scores.append(float(row["similarity_score"]))
            
            top_match_score = similarity_scores[0] if similarity_scores else 0.0
            
            return SimilarityResult(
                success=True,
                similar_incidents=similar_incidents,
                similarity_scores=similarity_scores,
                top_match_score=top_match_score
            )
            
        except Exception as e:
            logger.error(f"Error in similarity analysis: {str(e)}")
            return SimilarityResult(
                success=False,
                error=f"Similarity analysis error: {str(e)}"
            )
    
    def get_similarity_matrix(self, incidents: List[Dict[str, Any]]) -> np.ndarray:
        """
        Calculate similarity matrix for a list of incidents
        
        Args:
            incidents: List of incident data dictionaries
            
        Returns:
            Similarity matrix as numpy array
        """
        if not incidents:
            return np.array([])
        
        try:
            # Preprocess all incidents
            processed_incidents = []
            for incident in incidents:
                processed = self._preprocess_incident(incident)
                processed_incidents.append(processed.values[0])
            
            # Convert to numpy array
            incidents_array = np.array(processed_incidents)
            
            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(incidents_array)
            
            return similarity_matrix
            
        except Exception as e:
            logger.error(f"Error calculating similarity matrix: {str(e)}")
            return np.array([])
    
    def find_duplicate_candidates(self, data: Dict[str, Any], 
                                threshold: float = 0.8) -> SimilarityResult:
        """
        Find potential duplicate incidents based on high similarity
        
        Args:
            data: Dictionary containing incident features
            threshold: Similarity threshold for considering duplicates
            
        Returns:
            SimilarityResult with potential duplicates
        """
        result = self.find_similar_incidents(data, top_k=20, min_similarity=threshold)
        
        if result.success:
            # Filter for high similarity (potential duplicates)
            duplicates = []
            duplicate_scores = []
            
            for incident, score in zip(result.similar_incidents, result.similarity_scores):
                if score >= threshold:
                    duplicates.append(incident)
                    duplicate_scores.append(score)
            
            return SimilarityResult(
                success=True,
                similar_incidents=duplicates,
                similarity_scores=duplicate_scores,
                top_match_score=duplicate_scores[0] if duplicate_scores else 0.0
            )
        
        return result
    
    def get_dataset_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the loaded dataset
        
        Returns:
            Dictionary with dataset statistics
        """
        if self.df is None:
            return {"error": "Dataset not loaded"}
        
        stats = {
            "total_incidents": len(self.df),
            "incident_types": self.df["incident_type"].value_counts().to_dict(),
            "time_distribution": self.df["time_of_day"].value_counts().to_dict(),
            "features_used": self.similarity_features,
            "numeric_features": self.numeric_features
        }
        
        # Add numeric feature statistics
        for feature in self.numeric_features:
            if feature in self.df.columns:
                stats[f"{feature}_stats"] = {
                    "mean": float(self.df[feature].mean()),
                    "std": float(self.df[feature].std()),
                    "min": float(self.df[feature].min()),
                    "max": float(self.df[feature].max())
                }
        
        return stats
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on the endpoint
        
        Returns:
            Health status dictionary
        """
        return {
            "status": "healthy" if self.df is not None else "unhealthy",
            "data_loaded": self.df is not None,
            "data_path": self.data_path,
            "dataset_size": len(self.df) if self.df is not None else 0,
            "similarity_features": self.similarity_features,
            "valid_incident_types": self.valid_incident_types,
            "valid_time_of_day": self.valid_time_of_day,
            "timestamp": pd.Timestamp.now().isoformat()
        }


# Convenience functions for easy integration
def find_similar(data: Dict[str, Any], top_k: int = 5) -> Dict[str, Any]:
    """
    Simple similarity search function
    
    Args:
        data: Incident data dictionary
        top_k: Number of similar incidents to return
        
    Returns:
        Dictionary with similarity results
    """
    endpoint = SimilarityEndpoint()
    result = endpoint.find_similar_incidents(data, top_k)
    
    return {
        "success": result.success,
        "similar_incidents": result.similar_incidents,
        "similarity_scores": result.similarity_scores,
        "top_match_score": result.top_match_score,
        "error": result.error
    }


def find_duplicates(data: Dict[str, Any], threshold: float = 0.8) -> Dict[str, Any]:
    """
    Simple duplicate detection function
    
    Args:
        data: Incident data dictionary
        threshold: Similarity threshold for duplicates
        
    Returns:
        Dictionary with duplicate candidates
    """
    endpoint = SimilarityEndpoint()
    result = endpoint.find_duplicate_candidates(data, threshold)
    
    return {
        "success": result.success,
        "duplicate_candidates": result.similar_incidents,
        "similarity_scores": result.similarity_scores,
        "highest_similarity": result.top_match_score,
        "error": result.error
    }


if __name__ == "__main__":
    # Test the endpoint
    endpoint = SimilarityEndpoint()
    
    # Test incident
    test_incident = {
        "incident_type": "road_accident",
        "time_of_day": "evening",
        "has_media": 1,
        "upvotes": 3,
        "flags": 0,
        "injuries_reported": 1,
        "people_involved": 2,
        "distance_to_responder": 4,
        "near_sensitive_location": 1
    }
    
    print("=== Similarity Analysis Endpoint Test ===")
    print(f"Test incident: {test_incident['incident_type']} at {test_incident['time_of_day']}")
    
    # Find similar incidents
    result = endpoint.find_similar_incidents(test_incident, top_k=5)
    
    if result.success:
        print(f"\nFound {len(result.similar_incidents)} similar incidents:")
        for i, (incident, score) in enumerate(zip(result.similar_incidents, result.similarity_scores)):
            print(f"{i+1}. {incident['incident_type']} (Score: {score:.3f})")
            if 'priority_score' in incident:
                print(f"   Priority: {incident['priority_score']}")
    else:
        print(f"Error: {result.error}")
    
    # Test duplicate detection
    print("\n=== Duplicate Detection Test ===")
    duplicate_result = endpoint.find_duplicate_candidates(test_incident, threshold=0.7)
    
    if duplicate_result.success:
        if duplicate_result.similar_incidents:
            print(f"Found {len(duplicate_result.similar_incidents)} potential duplicates:")
            for incident, score in zip(duplicate_result.similar_incidents, duplicate_result.similarity_scores):
                print(f"- {incident['incident_type']} (Similarity: {score:.3f})")
        else:
            print("No potential duplicates found")
    else:
        print(f"Error: {duplicate_result.error}")
    
    # Health check
    print("\n=== Health Check ===")
    health = endpoint.health_check()
    print(f"Status: {health['status']}")
    print(f"Dataset Size: {health['dataset_size']}")
    
    # Dataset stats
    print("\n=== Dataset Statistics ===")
    stats = endpoint.get_dataset_stats()
    print(f"Total Incidents: {stats['total_incidents']}")
    print(f"Incident Types: {list(stats['incident_types'].keys())}")