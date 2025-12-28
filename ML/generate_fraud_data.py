import pandas as pd
import numpy as np

np.random.seed(42)

incident_types = [
    "road_accident", "medical_emergency", "fire",
    "violence", "power_outage", "gas_leak"
]

rows = []

for _ in range(4000):
    
    itype = np.random.choice(incident_types)

    description_length = np.random.randint(5, 150)
    has_media = np.random.binomial(1, 0.55)
    upvotes = np.random.poisson(2)
    flags = np.random.binomial(4, 0.2)
    duplicate_score = np.clip(np.random.normal(0.25, 0.18), 0, 1)

    # USER FEATURES
    account_age_days = np.random.randint(1, 900)
    total_reports_by_user = np.random.randint(1, 40)
    past_fraud_reports = np.random.binomial(5, 0.15)
    user_total_flags = np.random.randint(0, 15)
    verified_user = np.random.binomial(1, 0.6)

    similarity_to_previous = np.clip(np.random.normal(0.35, 0.25), 0, 1)
    posted_at_night = np.random.binomial(1, 0.25)

    # ---------- FRAUD RULES TO GENERATE LABEL ----------

    fraud_prob = 0.05

    if flags > 3:
        fraud_prob += 0.25
        
    if duplicate_score > 0.7:
        fraud_prob += 0.25
        
    if similarity_to_previous > 0.8:
        fraud_prob += 0.25

    if description_length < 12:
        fraud_prob += 0.15

    if past_fraud_reports >= 2:
        fraud_prob += 0.25

    if verified_user == 0 and account_age_days < 20:
        fraud_prob += 0.25

    if total_reports_by_user > 20 and upvotes == 0:
        fraud_prob += 0.15

    fraud_label = 1 if np.random.random() < fraud_prob else 0

    rows.append([
        itype, description_length, has_media, upvotes, flags,
        duplicate_score, similarity_to_previous, posted_at_night,
        account_age_days, total_reports_by_user, past_fraud_reports,
        user_total_flags, verified_user,
        fraud_label
    ])

df = pd.DataFrame(rows, columns=[
    "incident_type",
    "description_length",
    "has_media",
    "upvotes",
    "flags",
    "duplicate_score",
    "similarity_to_previous",
    "posted_at_night",
    "account_age_days",
    "total_reports_by_user",
    "past_fraud_reports",
    "user_total_flags",
    "verified_user",
    "fraud_label"
])

df.to_csv("fraud_dataset.csv", index=False)
print("Saved fraud_dataset.csv")
