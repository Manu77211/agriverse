"""
Improved ML Model Training with Cross-Validation and Hyperparameter Tuning
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_PATH = os.path.join(DATA_DIR, "Crop_recommendation.csv")
MODEL_PATH = os.path.join(DATA_DIR, "crop_model.joblib")
ENCODER_PATH = os.path.join(DATA_DIR, "label_encoder.joblib")
METADATA_PATH = os.path.join(DATA_DIR, "model_metadata.json")

os.makedirs(DATA_DIR, exist_ok=True)

print("=" * 70)
print("KRISHI SAKHI — IMPROVED ML MODEL TRAINING")
print("=" * 70)

# Load dataset
print("\n[1/6] Loading dataset...")
df = pd.read_csv(CSV_PATH)
df.columns = df.columns.str.strip()
if 'label' in df.columns:
    df['label'] = df['label'].astype(str).str.strip().str.lower()

print(f"✓ Dataset loaded: {len(df)} rows, {len(df['label'].unique())} unique crops")
print(f"   Crops: {sorted(df['label'].unique())}")

# Prepare data
print("\n[2/6] Preparing features and labels...")
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print(f"✓ Features shape: {X.shape}")
print(f"✓ Classes: {len(label_encoder.classes_)}")

# Split data
print("\n[3/6] Splitting data (80/20 train/validation)...")
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
print(f"✓ Training set: {len(X_train)} samples")
print(f"✓ Validation set: {len(X_test)} samples")

# Hyperparameter tuning with GridSearchCV
print("\n[4/6] Hyperparameter tuning with cross-validation...")
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [5, 7, 9],
    'learning_rate': [0.05, 0.1, 0.2],
    'subsample': [0.8, 0.9, 1.0]
}

xgb_base = XGBClassifier(random_state=42, eval_metric='mlogloss')
grid_search = GridSearchCV(xgb_base, param_grid, cv=5, verbose=1, n_jobs=-1)
grid_search.fit(X_train, y_train)

print(f"\n✓ Best parameters found:")
print(f"   {grid_search.best_params_}")
print(f"✓ Best CV score: {grid_search.best_score_:.4f}")

model = grid_search.best_estimator_

# Evaluate
print("\n[5/6] Evaluating on validation set...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✓ Final Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_, digits=3))

# Cross-validation on full dataset
print("\n[6/6] Final cross-validation on entire dataset...")
cv_scores = cross_val_score(model, X, y_encoded, cv=5)
print(f"✓ Cross-validation scores: {cv_scores}")
print(f"✓ Mean CV Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")

if accuracy < 0.85:
    print(f"\n❌ WARNING: Model accuracy ({accuracy * 100:.2f}%) is below 85% threshold!")
    exit(1)

# Save model
print("\n[SAVING] Serializing model and metadata...")
joblib.dump(model, MODEL_PATH)
joblib.dump(label_encoder, ENCODER_PATH)

metadata = {
    "version": "2.0.0",
    "model_type": "XGBoost",
    "accuracy": round(accuracy, 4),
    "accuracy_percentage": round(accuracy * 100, 2),
    "cv_mean_accuracy": round(cv_scores.mean(), 4),
    "cv_std": round(cv_scores.std(), 4),
    "training_date": datetime.utcnow().isoformat(),
    "hyperparameters": grid_search.best_params_,
    "features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
    "classes": label_encoder.classes_.tolist(),
    "num_classes": len(label_encoder.classes_),
    "training_samples": len(X_train),
    "validation_samples": len(X_test),
    "total_samples": len(df),
    "cross_val_scores": cv_scores.tolist()
}

with open(METADATA_PATH, 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"\n✓ Model saved: {MODEL_PATH}")
print(f"✓ Encoder saved: {ENCODER_PATH}")
print(f"✓ Metadata saved: {METADATA_PATH}")

print("\n" + "=" * 70)
print("MODEL TRAINING COMPLETE!")
print("=" * 70)
print(f"\nModel Version: {metadata['version']}")
print(f"Validation Accuracy: {metadata['accuracy_percentage']}%")
print(f"CV Mean Accuracy: {round(cv_scores.mean() * 100, 2)}%")
print(f"Total Classes: {metadata['num_classes']}")
print("=" * 70 + "\n")
