import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor

DATA_PATH = "synthetic_incidents.csv"

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

target = "priority_score"

features = [
    "incident_type",
    "description_length",
    "has_media",
    "upvotes",
    "flags",
    "duplicate_score",
    "injuries_reported",
    "people_involved",
    "distance_to_responder",
    "near_sensitive_location",
    "time_of_day"
]

X = df[features]
y = df[target]

categorical = ["incident_type", "time_of_day"]
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
        (
            "rf",
            RandomForestRegressor(
                n_estimators=220,
                max_depth=None,
                random_state=42,
                n_jobs=-1
            ),
        ),
    ]
)

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training model...")
model.fit(X_train, y_train)

print("Evaluating...")
preds = model.predict(X_test)

mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)

print(f"MAE: {mae:.2f}")
print(f"R²:  {r2:.3f}")

MODEL_PATH = "risk_priority_model.pkl"
joblib.dump(model, MODEL_PATH)

print(f"Saved model to {MODEL_PATH}")
