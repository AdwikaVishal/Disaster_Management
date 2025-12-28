import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

DATA_PATH = "synthetic_incidents.csv"

df = pd.read_csv(DATA_PATH)

features = [
    "incident_type",
    "time_of_day",
    "has_media",
    "upvotes",
    "flags",
    "injuries_reported",
    "people_involved",
    "distance_to_responder",
    "near_sensitive_location"
]

X = df[features].copy()

# --- One-hot encode categorical ---
X = pd.get_dummies(X, columns=["incident_type", "time_of_day"])

# --- Scale numeric ---
scaler = MinMaxScaler()

numeric_cols = [
    "has_media",
    "upvotes",
    "flags",
    "injuries_reported",
    "people_involved",
    "distance_to_responder",
    "near_sensitive_location"
]

X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

# -------- Test incident --------
new_incident = pd.DataFrame([{
    "incident_type": "road_accident",
    "time_of_day": "evening",
    "has_media": 1,
    "upvotes": 3,
    "flags": 0,
    "injuries_reported": 1,
    "people_involved": 2,
    "distance_to_responder": 4,
    "near_sensitive_location": 1
}])

new_incident = pd.get_dummies(new_incident)

new_incident = new_incident.reindex(columns=X.columns, fill_value=0)

new_incident[numeric_cols] = scaler.transform(new_incident[numeric_cols])

sims = cosine_similarity(new_incident, X)[0]

df_sim = df.copy()
df_sim["similarity"] = sims

print(
    df_sim[["incident_type", "priority_score", "similarity"]]
    .sort_values("similarity", ascending=False)
    .head(10)
)
