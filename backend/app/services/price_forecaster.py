"""Price Forecast Service - Load ARIMA models and predict 1-year ahead"""

import joblib
import json
import os
from typing import Dict, Optional

class PriceForecaster:
    def __init__(self):
        self.predictions = {}
        # Use absolute path relative to this file location
        # File structure: backend/app/services/price_forecaster.py → backend/data/price_predictions.json
        service_file = os.path.abspath(__file__)  # /backend/app/services/price_forecaster.py
        service_dir = os.path.dirname(service_file)  # /backend/app/services
        app_dir = os.path.dirname(service_dir)  # /backend/app
        backend_dir = os.path.dirname(app_dir)  # /backend
        
        self.predictions_file = os.path.join(backend_dir, "data", "price_predictions.json")
        self.models_dir = os.path.join(backend_dir, "data", "price_models")
        
        print(f"DEBUG: PriceForecaster initialized")
        print(f"  Service file: {service_file}")
        print(f"  Backend dir: {backend_dir}")
        print(f"  Predictions file: {self.predictions_file}")
        print(f"  File exists: {os.path.exists(self.predictions_file)}")
        self.load_predictions()
    
    def load_predictions(self):
        """Load pre-trained predictions from JSON"""
        try:
            if os.path.exists(self.predictions_file):
                with open(self.predictions_file) as f:
                    self.predictions = json.load(f)
                print(f"✓ Loaded price predictions for {len(self.predictions)} crops")
                print(f"  Available crops: {list(self.predictions.keys())[:5]}...")
            else:
                print(f"⚠ Price predictions file not found at {self.predictions_file}")
        except Exception as e:
            print(f"⚠ Error loading predictions: {e}")
    
    def get_forecast(self, crop: str) -> Optional[Dict]:
        """Get 1-year price forecast for a crop"""
        crop_key = crop.capitalize()
        if crop_key in self.predictions:
            return self.predictions[crop_key]
        return None
    
    def get_future_profit(self, crop: str, yield_per_acre: float, 
                         cost_per_acre: float) -> Optional[Dict]:
        """Calculate expected profit using predicted price (converts quintal price to per-acre profit)"""
        forecast = self.get_forecast(crop)
        
        if not forecast:
            # Fallback: assume -5% price change
            current_price_quintal = 2500  # Default quintal price
            predicted_price_quintal = current_price_quintal * 0.95
            revenue = yield_per_acre * predicted_price_quintal
            profit = revenue - cost_per_acre
            return {
                'predicted_price': round(predicted_price_quintal / 100.0, 2),  # Convert to per kg
                'revenue': round(revenue, 2),
                'profit': round(profit, 2),
                'current_price': round(current_price_quintal / 100.0, 2),  # Convert to per kg
                'price_change_percent': -5.0,
                'confidence_range': {
                    'low': round((predicted_price_quintal * 0.8) / 100.0, 2),
                    'high': round((predicted_price_quintal * 1.2) / 100.0, 2)
                }
            }
        
        # Prices in predictions.json are per quintal; convert to per kg for frontend
        predicted_price_quintal = forecast['predicted_price_1y']
        current_price_quintal = forecast['current_price']
        revenue = yield_per_acre * predicted_price_quintal
        profit = revenue - cost_per_acre
        
        result = {
            'predicted_price': round(predicted_price_quintal / 100.0, 2),  # Convert to per kg
            'revenue': round(revenue, 2),
            'profit': round(profit, 2),
            'current_price': round(current_price_quintal / 100.0, 2),  # Convert to per kg
            'price_change_percent': forecast['price_change_percent'],
            'confidence_range': {
                'low': round(forecast['lower_bound'] / 100.0, 2),
                'high': round(forecast['upper_bound'] / 100.0, 2)
            }
        }
        return result
