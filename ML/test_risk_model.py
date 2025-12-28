import joblib
import pandas as pd

MODEL_PATH = "risk_priority_model.pkl"

print("Loading model...")
model = joblib.load(MODEL_PATH)

# --------- SAMPLE INCIDENTS TO TEST ----------
samples = [
    # 🚑 Serious accident, night, injuries
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

    # 🔥 Fire but far away, fewer confirmations
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
    },

    # ⚠️ Possibly spammy / duplicate report
    {
        "incident_type": "power_outage",
        "description_length": 20,
        "has_media": 0,
        "upvotes": 0,
        "flags": 2,
        "duplicate_score": 0.9,
        "injuries_reported": 0,
        "people_involved": 1,
        "distance_to_responder": 2,
        "near_sensitive_location": 0,
        "time_of_day": "morning"
    }
]

df = pd.DataFrame(samples)

print("\nRunning predictions...")
preds = model.predict(df)

for incident, score in zip(samples, preds):
    print("\n--------------------------------")
    print(incident)
    print("➡ Predicted Risk Score:", round(float(score), 2))
