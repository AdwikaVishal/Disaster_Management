import joblib
import pandas as pd

model = joblib.load("fraud_detector.pkl")

sample = pd.DataFrame([{
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
}])

print("Fraud probability:", model.predict_proba(sample)[0][1])
