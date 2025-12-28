"""
Example usage of all ML endpoints

This file demonstrates how to use the fraud detection, risk priority, 
and similarity analysis endpoints together.
"""

from fraud_endpoint import FraudDetectionEndpoint, predict_fraud
from risk_endpoint import RiskPriorityEndpoint, predict_risk
from similarity_endpoint import SimilarityEndpoint, find_similar, find_duplicates


def analyze_incident_comprehensive(incident_data):
    """
    Perform comprehensive analysis of an incident using all endpoints
    
    Args:
        incident_data: Dictionary with incident features
        
    Returns:
        Dictionary with all analysis results
    """
    results = {
        "incident": incident_data,
        "fraud_analysis": None,
        "risk_analysis": None,
        "similarity_analysis": None,
        "recommendations": []
    }
    
    # Initialize endpoints
    fraud_endpoint = FraudDetectionEndpoint()
    risk_endpoint = RiskPriorityEndpoint()
    similarity_endpoint = SimilarityEndpoint()
    
    # Fraud Detection Analysis
    if all(feature in incident_data for feature in fraud_endpoint.required_features):
        fraud_result = fraud_endpoint.predict(incident_data)
        if fraud_result.success:
            results["fraud_analysis"] = {
                "fraud_probability": fraud_result.fraud_probability,
                "is_fraud": fraud_result.is_fraud,
                "confidence": fraud_result.confidence
            }
            
            # Add recommendations based on fraud analysis
            if fraud_result.fraud_probability > 0.7:
                results["recommendations"].append("HIGH FRAUD RISK - Requires immediate verification")
            elif fraud_result.fraud_probability > 0.3:
                results["recommendations"].append("Moderate fraud risk - Additional verification recommended")
    
    # Risk Priority Analysis
    if all(feature in incident_data for feature in risk_endpoint.required_features):
        risk_result = risk_endpoint.predict(incident_data)
        if risk_result.success:
            results["risk_analysis"] = {
                "risk_score": risk_result.risk_score,
                "risk_level": risk_result.risk_level,
                "confidence": risk_result.confidence
            }
            
            # Add recommendations based on risk analysis
            if risk_result.risk_level == "critical":
                results["recommendations"].append("CRITICAL PRIORITY - Immediate response required")
            elif risk_result.risk_level == "high":
                results["recommendations"].append("High priority - Expedited response recommended")
    
    # Similarity Analysis
    if all(feature in incident_data for feature in similarity_endpoint.similarity_features):
        # Find similar incidents
        similarity_result = similarity_endpoint.find_similar_incidents(incident_data, top_k=3)
        if similarity_result.success:
            results["similarity_analysis"] = {
                "similar_incidents_count": len(similarity_result.similar_incidents),
                "top_similarity_score": similarity_result.top_match_score,
                "similar_incidents": similarity_result.similar_incidents[:3]  # Top 3
            }
        
        # Check for potential duplicates
        duplicate_result = similarity_endpoint.find_duplicate_candidates(incident_data, threshold=0.8)
        if duplicate_result.success and duplicate_result.similar_incidents:
            results["similarity_analysis"]["potential_duplicates"] = len(duplicate_result.similar_incidents)
            results["recommendations"].append(f"Potential duplicate detected - {len(duplicate_result.similar_incidents)} similar incidents found")
    
    return results


def main():
    """Example usage of all endpoints"""
    
    print("=== ML Endpoints Usage Example ===\n")
    
    # Example incident data (contains all required features for all models)
    incident = {
        # Common features
        "incident_type": "road_accident",
        "description_length": 85,
        "has_media": 1,
        "upvotes": 4,
        "flags": 0,
        "duplicate_score": 0.15,
        
        # Fraud model specific features
        "similarity_to_previous": 0.25,
        "posted_at_night": 1,
        "account_age_days": 45,
        "total_reports_by_user": 3,
        "past_fraud_reports": 0,
        "user_total_flags": 1,
        "verified_user": 1,
        
        # Risk model specific features
        "injuries_reported": 2,
        "people_involved": 3,
        "distance_to_responder": 2.5,
        "near_sensitive_location": 1,
        "time_of_day": "night"
    }
    
    # Comprehensive analysis
    print("1. COMPREHENSIVE INCIDENT ANALYSIS")
    print("=" * 50)
    analysis = analyze_incident_comprehensive(incident)
    
    print(f"Incident Type: {analysis['incident']['incident_type']}")
    print(f"Time: {analysis['incident']['time_of_day']}")
    print(f"Injuries: {analysis['incident']['injuries_reported']}")
    print(f"People Involved: {analysis['incident']['people_involved']}")
    
    if analysis["fraud_analysis"]:
        print(f"\nFRAUD ANALYSIS:")
        print(f"  Fraud Probability: {analysis['fraud_analysis']['fraud_probability']:.3f}")
        print(f"  Is Fraud: {analysis['fraud_analysis']['is_fraud']}")
        print(f"  Confidence: {analysis['fraud_analysis']['confidence']:.3f}")
    
    if analysis["risk_analysis"]:
        print(f"\nRISK ANALYSIS:")
        print(f"  Risk Score: {analysis['risk_analysis']['risk_score']:.2f}")
        print(f"  Risk Level: {analysis['risk_analysis']['risk_level'].upper()}")
        print(f"  Confidence: {analysis['risk_analysis']['confidence']:.3f}")
    
    if analysis["similarity_analysis"]:
        print(f"\nSIMILARITY ANALYSIS:")
        print(f"  Similar Incidents Found: {analysis['similarity_analysis']['similar_incidents_count']}")
        print(f"  Top Similarity Score: {analysis['similarity_analysis']['top_similarity_score']:.3f}")
        if "potential_duplicates" in analysis["similarity_analysis"]:
            print(f"  Potential Duplicates: {analysis['similarity_analysis']['potential_duplicates']}")
    
    if analysis["recommendations"]:
        print(f"\nRECOMMENDATIONS:")
        for i, rec in enumerate(analysis["recommendations"], 1):
            print(f"  {i}. {rec}")
    
    print("\n" + "=" * 70)
    
    # Individual endpoint usage examples
    print("\n2. INDIVIDUAL ENDPOINT USAGE")
    print("=" * 50)
    
    # Fraud detection only
    print("\nFRAUD DETECTION:")
    fraud_result = predict_fraud(incident)
    print(f"  Result: {fraud_result}")
    
    # Risk assessment only
    print("\nRISK ASSESSMENT:")
    risk_result = predict_risk(incident)
    print(f"  Result: {risk_result}")
    
    # Similarity search only
    print("\nSIMILARITY SEARCH:")
    similarity_result = find_similar(incident, top_k=3)
    if similarity_result["success"]:
        print(f"  Found {len(similarity_result['similar_incidents'])} similar incidents")
        print(f"  Top similarity: {similarity_result['top_match_score']:.3f}")
    
    # Duplicate detection only
    print("\nDUPLICATE DETECTION:")
    duplicate_result = find_duplicates(incident, threshold=0.7)
    if duplicate_result["success"]:
        if duplicate_result["duplicate_candidates"]:
            print(f"  Found {len(duplicate_result['duplicate_candidates'])} potential duplicates")
            print(f"  Highest similarity: {duplicate_result['highest_similarity']:.3f}")
        else:
            print("  No duplicates found")
    
    print("\n" + "=" * 70)
    
    # Health checks
    print("\n3. ENDPOINT HEALTH CHECKS")
    print("=" * 50)
    
    endpoints = [
        ("Fraud Detection", FraudDetectionEndpoint()),
        ("Risk Priority", RiskPriorityEndpoint()),
        ("Similarity Analysis", SimilarityEndpoint())
    ]
    
    for name, endpoint in endpoints:
        health = endpoint.health_check()
        print(f"{name}: {health['status'].upper()}")


if __name__ == "__main__":
    main()