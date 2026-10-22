#!/usr/bin/env python3
"""
Test if ML model is actually being used or falling back to rule-based
"""
import os
import joblib
import numpy as np

# Same paths as in recommendation.py
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "data", "crop_model.joblib")
ENCODER_PATH = os.path.join(BASE_DIR, "data", "label_encoder.joblib")

print(f"Testing ML model usage...")
print(f"Model path: {MODEL_PATH}")
print(f"Exists: {os.path.exists(MODEL_PATH)}")

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        
        print(f"\n✓ Model loaded successfully!")
        print(f"Model type: {type(model)}")
        print(f"Model params: {model.get_params()}")
        print(f"Number of classes: {len(label_encoder.classes_)}")
        print(f"Classes: {label_encoder.classes_}")
        
        # Test prediction
        test_input = np.array([[90, 42, 43, 20.8, 82, 6.5, 202]])  # Example from dataset
        probabilities = model.predict_proba(test_input)[0]
        
        print(f"\nTest prediction:")
        print(f"Input features: N=90, P=42, K=43, temp=20.8, hum=82, pH=6.5, rain=202")
        
        top_indices = np.argsort(probabilities)[::-1][:3]
        for idx in top_indices:
            crop = label_encoder.classes_[idx]
            prob = probabilities[idx]
            print(f"  - {crop}: {prob:.3f} ({prob*100:.1f}%)")
            
    except Exception as e:
        print(f"\n❌ Error loading model: {e}")
else:
    print("❌ Model file not found!")