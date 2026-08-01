"""
Tests for ML crop recommendation model training and prediction.
"""

import os
import json
import joblib
import pytest
import pandas as pd
import numpy as np
from pathlib import Path


class TestModelTraining:
    """Test cases for model training and artifacts."""
    
    @pytest.fixture
    def data_dir(self):
        """Return data directory path."""
        return Path(__file__).parent.parent / "data"
    
    @pytest.fixture
    def model_artifacts(self, data_dir):
        """Load all model artifacts."""
        return {
            "model_path": data_dir / "crop_model.joblib",
            "encoder_path": data_dir / "label_encoder.joblib",
            "metadata_path": data_dir / "model_metadata.json",
            "csv_path": data_dir / "Crop_recommendation.csv"
        }
    
    def test_model_file_exists(self, model_artifacts):
        """Test that trained model file exists."""
        assert model_artifacts["model_path"].exists(), "Model file not found"
    
    def test_encoder_file_exists(self, model_artifacts):
        """Test that label encoder file exists."""
        assert model_artifacts["encoder_path"].exists(), "Label encoder not found"
    
    def test_metadata_file_exists(self, model_artifacts):
        """Test that metadata file exists."""
        assert model_artifacts["metadata_path"].exists(), "Metadata file not found"
    
    def test_model_can_be_loaded(self, model_artifacts):
        """Test that model can be loaded from joblib."""
        model = joblib.load(model_artifacts["model_path"])
        assert model is not None, "Failed to load model"
        assert hasattr(model, "predict"), "Model missing predict method"
        assert hasattr(model, "predict_proba"), "Model missing predict_proba method"
    
    def test_encoder_can_be_loaded(self, model_artifacts):
        """Test that label encoder can be loaded."""
        encoder = joblib.load(model_artifacts["encoder_path"])
        assert encoder is not None, "Failed to load encoder"
        assert hasattr(encoder, "transform"), "Encoder missing transform method"
        assert hasattr(encoder, "inverse_transform"), "Encoder missing inverse_transform"
    
    def test_metadata_structure(self, model_artifacts):
        """Test metadata JSON has required fields."""
        with open(model_artifacts["metadata_path"], 'r') as f:
            metadata = json.load(f)
        
        required_fields = [
            "version", "model_type", "accuracy", "accuracy_percentage",
            "training_date", "hyperparameters", "features", "classes",
            "num_classes", "training_samples", "validation_samples", "total_samples"
        ]
        for field in required_fields:
            assert field in metadata, f"Missing required field: {field}"
    
    def test_model_accuracy_threshold(self, model_artifacts):
        """Test that model accuracy meets minimum 85% threshold."""
        with open(model_artifacts["metadata_path"], 'r') as f:
            metadata = json.load(f)
        
        accuracy = metadata["accuracy_percentage"]
        assert accuracy >= 85, f"Model accuracy {accuracy}% is below 85% threshold"
    
    def test_metadata_contains_expected_crops(self, model_artifacts):
        """Test that metadata contains expected crop classes."""
        with open(model_artifacts["metadata_path"], 'r') as f:
            metadata = json.load(f)
        
        # These are the core crops we expect to be in the model
        expected_crops = [
            'rice', 'maize', 'chickpea', 'lentil', 'cotton', 'jute',
            'coffee', 'coconut', 'banana', 'mango', 'grapes',
            'apple', 'orange', 'papaya', 'pomegranate', 'watermelon'
        ]
        
        classes = metadata["classes"]
        for crop in expected_crops:
            assert crop in classes, f"Expected crop '{crop}' not in model classes"
        
        # Verify we have a reasonable number of crops (at least 15)
        assert len(classes) >= 15, f"Model has too few crop classes: {len(classes)}"
    
    def test_dataset_size(self, model_artifacts):
        """Test that dataset has approximately 2200 training examples."""
        with open(model_artifacts["metadata_path"], 'r') as f:
            metadata = json.load(f)
        
        total_samples = metadata["total_samples"]
        assert total_samples >= 2000, f"Dataset size {total_samples} is less than expected"
        assert total_samples <= 3000, f"Dataset size {total_samples} is larger than expected"
    
    def test_features_are_correct(self, model_artifacts):
        """Test that model features match expected soil/climate parameters."""
        with open(model_artifacts["metadata_path"], 'r') as f:
            metadata = json.load(f)
        
        expected_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        assert metadata["features"] == expected_features, "Features do not match expected list"


class TestModelPrediction:
    """Test cases for model predictions."""
    
    @pytest.fixture
    def data_dir(self):
        """Return data directory path."""
        return Path(__file__).parent.parent / "data"
    
    @pytest.fixture
    def model_and_encoder(self, data_dir):
        """Load model and encoder."""
        model = joblib.load(data_dir / "crop_model.joblib")
        encoder = joblib.load(data_dir / "label_encoder.joblib")
        return model, encoder
    
    def test_model_accepts_valid_input(self, model_and_encoder):
        """Test that model accepts valid input features."""
        model, _ = model_and_encoder
        
        # Create sample input with correct features
        sample = pd.DataFrame({
            'N': [60],
            'P': [50],
            'K': [35],
            'temperature': [21.5],
            'humidity': [75],
            'ph': [6.5],
            'rainfall': [150]
        })
        
        prediction = model.predict(sample)
        assert prediction is not None, "Model failed to predict"
        assert len(prediction) == 1, "Prediction array has wrong length"
    
    def test_model_returns_valid_class_index(self, model_and_encoder):
        """Test that model returns valid class indices."""
        model, encoder = model_and_encoder
        num_classes = len(encoder.classes_)
        
        sample = pd.DataFrame({
            'N': [60],
            'P': [50],
            'K': [35],
            'temperature': [21.5],
            'humidity': [75],
            'ph': [6.5],
            'rainfall': [150]
        })
        
        prediction = model.predict(sample)
        assert 0 <= prediction[0] < num_classes, "Model returned invalid class index"
    
    def test_model_returns_probabilities(self, model_and_encoder):
        """Test that model returns probability scores for all classes."""
        model, encoder = model_and_encoder
        num_classes = len(encoder.classes_)
        
        sample = pd.DataFrame({
            'N': [60],
            'P': [50],
            'K': [35],
            'temperature': [21.5],
            'humidity': [75],
            'ph': [6.5],
            'rainfall': [150]
        })
        
        proba = model.predict_proba(sample)
        
        assert proba is not None, "Model failed to return probabilities"
        assert proba.shape == (1, num_classes), f"Probability shape {proba.shape} is incorrect"
        assert np.allclose(np.sum(proba), 1.0), "Probabilities do not sum to 1"
    
    def test_model_top_5_predictions(self, model_and_encoder):
        """Test that model returns top 5 crops with confidence scores."""
        model, encoder = model_and_encoder
        
        sample = pd.DataFrame({
            'N': [60],
            'P': [50],
            'K': [35],
            'temperature': [21.5],
            'humidity': [75],
            'ph': [6.5],
            'rainfall': [150]
        })
        
        proba = model.predict_proba(sample)[0]
        top_5_indices = np.argsort(proba)[::-1][:5]
        top_5_crops = encoder.classes_[top_5_indices]
        top_5_scores = proba[top_5_indices]
        
        assert len(top_5_crops) == 5, "Did not return top 5 crops"
        assert len(top_5_scores) == 5, "Did not return 5 scores"
        assert all(0 <= score <= 1 for score in top_5_scores), "Scores not in valid range"
        assert all(isinstance(crop, (str, np.str_)) for crop in top_5_crops), "Crops not strings"
    
    def test_encoder_inverse_transform(self, model_and_encoder):
        """Test that encoder can convert indices back to crop names."""
        model, encoder = model_and_encoder
        
        sample = pd.DataFrame({
            'N': [60],
            'P': [50],
            'K': [35],
            'temperature': [21.5],
            'humidity': [75],
            'ph': [6.5],
            'rainfall': [150]
        })
        
        prediction_idx = model.predict(sample)[0]
        crop_name = encoder.inverse_transform([prediction_idx])[0]
        
        assert isinstance(crop_name, (str, np.str_)), "Crop name is not a string"
        assert crop_name in encoder.classes_, "Crop name not in encoder classes"
    
    def test_multiple_predictions(self, model_and_encoder):
        """Test that model can make multiple predictions in batch."""
        model, encoder = model_and_encoder
        
        samples = pd.DataFrame({
            'N': [60, 70, 80],
            'P': [50, 40, 35],
            'K': [35, 25, 30],
            'temperature': [21.5, 25, 20],
            'humidity': [75, 60, 80],
            'ph': [6.5, 6.8, 7.0],
            'rainfall': [150, 100, 200]
        })
        
        predictions = model.predict(samples)
        probas = model.predict_proba(samples)
        
        assert len(predictions) == 3, "Did not return 3 predictions"
        assert probas.shape == (3, len(encoder.classes_)), "Probability shape incorrect"


class TestModelIntegration:
    """Integration tests for model usage in production."""
    
    @pytest.fixture
    def data_dir(self):
        """Return data directory path."""
        return Path(__file__).parent.parent / "data"
    
    def test_model_production_workflow(self, data_dir):
        """Test complete model loading and prediction workflow."""
        # Load model and encoder
        model = joblib.load(data_dir / "crop_model.joblib")
        encoder = joblib.load(data_dir / "label_encoder.joblib")
        
        with open(data_dir / "model_metadata.json", 'r') as f:
            metadata = json.load(f)
        
        # Create prediction request
        sample = pd.DataFrame({
            'N': [75],
            'P': [45],
            'K': [40],
            'temperature': [23],
            'humidity': [80],
            'ph': [6.5],
            'rainfall': [200]
        })
        
        # Make prediction
        prediction = model.predict(sample)[0]
        proba = model.predict_proba(sample)[0]
        
        # Get top 5
        top_5_indices = np.argsort(proba)[::-1][:5]
        top_5_crops = encoder.classes_[top_5_indices]
        top_5_scores = proba[top_5_indices]
        
        # Verify response structure
        assert prediction >= 0, "Invalid prediction index"
        assert len(top_5_crops) == 5, "Not returning 5 crops"
        assert all(crop in metadata['classes'] for crop in top_5_crops), "Crops not in metadata"
        assert all(0 <= score <= 1 for score in top_5_scores), "Scores not in valid range"
    
    def test_metadata_version_consistency(self, data_dir):
        """Test that metadata version matches code expectations."""
        with open(data_dir / "model_metadata.json", 'r') as f:
            metadata = json.load(f)
        
        # Version should exist and be semantic versioning
        assert "version" in metadata
        version_parts = metadata["version"].split('.')
        assert len(version_parts) >= 2, "Version not in semantic format"
