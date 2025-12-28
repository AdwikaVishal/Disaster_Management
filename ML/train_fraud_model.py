import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from sklearn.ensemble import GradientBoostingClassifier

df = pd.read_csv("fraud_dataset.csv")

target = "fraud_label"

features = [
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
    "verified_user"
]

X = df[features]
y = df[target]

categorical = ["incident_type"]
numeric = list(set(features) - set(categorical))

preprocess = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", "passthrough", numeric)
    ]
)

model = Pipeline(
    steps=[
        ("prep", preprocess),
        ("clf", GradientBoostingClassifier())
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

model.fit(X_train, y_train)

preds = model.predict(X_test)

print(classification_report(y_test, preds))

joblib.dump(model, "fraud_detector.pkl")
print("Saved fraud_detector.pkl")
