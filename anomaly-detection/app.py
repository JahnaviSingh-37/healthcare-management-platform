from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Load or initialize the anomaly detection model
MODEL_PATH = 'anomaly_model.pkl'
SCALER_PATH = 'scaler.pkl'

class AnomalyDetector:
    def __init__(self):
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
        else:
            self.model = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=100
            )
            self.scaler = StandardScaler()
            self.is_trained = False
    
    def extract_features(self, log_data):
        """Extract features from audit log data"""
        features = []
        
        # Time-based features
        hour = datetime.fromisoformat(log_data['timestamp'].replace('Z', '+00:00')).hour
        features.append(hour)
        
        # Action frequency (simulated - in production, query from database)
        features.append(log_data.get('action_frequency', 1))
        
        # Risk score
        features.append(log_data.get('riskScore', 0))
        
        # Access pattern features
        features.append(1 if log_data.get('sensitiveData', False) else 0)
        features.append(1 if log_data.get('afterHours', False) else 0)
        features.append(1 if log_data.get('unusualLocation', False) else 0)
        
        # User role risk (admin=3, doctor=2, nurse=1, patient=0)
        role_risk = {'admin': 3, 'doctor': 2, 'nurse': 1, 'patient': 0}
        features.append(role_risk.get(log_data.get('userRole', 'patient'), 0))
        
        # Data access volume
        features.append(log_data.get('dataAccessCount', 1))
        
        return np.array(features).reshape(1, -1)
    
    def train(self, training_data):
        """Train the anomaly detection model"""
        X = np.array([self.extract_features(log).flatten() for log in training_data])
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_trained = True
        
        # Save the model
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
        
        return True
    
    def predict(self, log_data):
        """Predict if the log is anomalous"""
        features = self.extract_features(log_data)
        
        if hasattr(self, 'is_trained') and not self.is_trained:
            # If not trained, use rule-based detection
            return self.rule_based_detection(log_data)
        
        try:
            features_scaled = self.scaler.transform(features)
            prediction = self.model.predict(features_scaled)
            anomaly_score = self.model.score_samples(features_scaled)
            
            # -1 means anomaly, 1 means normal
            is_anomaly = prediction[0] == -1
            confidence = abs(anomaly_score[0])
            
            return {
                'is_anomaly': bool(is_anomaly),
                'confidence': float(confidence),
                'risk_score': self.calculate_risk_score(log_data, is_anomaly, confidence)
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self.rule_based_detection(log_data)
    
    def rule_based_detection(self, log_data):
        """Fallback rule-based anomaly detection"""
        risk_score = 0
        reasons = []
        
        # Check for suspicious patterns
        hour = datetime.fromisoformat(log_data['timestamp'].replace('Z', '+00:00')).hour
        
        # After hours access (10 PM - 6 AM)
        if hour < 6 or hour > 22:
            risk_score += 30
            reasons.append('After-hours access')
        
        # High-risk actions
        high_risk_actions = ['DELETE', 'EXPORT', 'ADMIN_ACCESS', 'BULK_ACCESS']
        if log_data.get('action', '').upper() in high_risk_actions:
            risk_score += 40
            reasons.append('High-risk action')
        
        # Multiple failed attempts
        if log_data.get('failedAttempts', 0) > 3:
            risk_score += 50
            reasons.append('Multiple failed attempts')
        
        # Unusual data volume
        if log_data.get('dataAccessCount', 0) > 50:
            risk_score += 35
            reasons.append('Unusual data access volume')
        
        # Sensitive data access
        if log_data.get('sensitiveData', False):
            risk_score += 20
            reasons.append('Sensitive data access')
        
        is_anomaly = risk_score >= 50
        
        return {
            'is_anomaly': is_anomaly,
            'confidence': min(risk_score / 100, 1.0),
            'risk_score': min(risk_score, 100),
            'reasons': reasons
        }
    
    def calculate_risk_score(self, log_data, is_anomaly, confidence):
        """Calculate overall risk score"""
        base_score = 50 if is_anomaly else 10
        confidence_factor = confidence * 50
        
        # Additional risk factors
        additional_risk = 0
        if log_data.get('sensitiveData', False):
            additional_risk += 20
        if log_data.get('afterHours', False):
            additional_risk += 15
        if log_data.get('failedAttempts', 0) > 3:
            additional_risk += 25
        
        total_score = min(base_score + confidence_factor + additional_risk, 100)
        return int(total_score)

# Initialize detector
detector = AnomalyDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'anomaly-detection',
        'model_trained': hasattr(detector, 'is_trained') and detector.is_trained
    })

@app.route('/detect', methods=['POST'])
def detect_anomaly():
    """Detect anomalies in audit log data"""
    try:
        log_data = request.json
        
        if not log_data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = detector.predict(log_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/batch-detect', methods=['POST'])
def batch_detect():
    """Detect anomalies in batch"""
    try:
        logs = request.json.get('logs', [])
        
        if not logs:
            return jsonify({'error': 'No logs provided'}), 400
        
        results = []
        for log in logs:
            result = detector.predict(log)
            results.append({
                'log_id': log.get('id'),
                'anomaly_detection': result
            })
        
        # Calculate summary statistics
        anomalies_count = sum(1 for r in results if r['anomaly_detection']['is_anomaly'])
        
        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'summary': {
                    'total_logs': len(logs),
                    'anomalies_detected': anomalies_count,
                    'anomaly_rate': round(anomalies_count / len(logs) * 100, 2)
                }
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/train', methods=['POST'])
def train_model():
    """Train the anomaly detection model with historical data"""
    try:
        training_data = request.json.get('training_data', [])
        
        if len(training_data) < 10:
            return jsonify({
                'error': 'Insufficient training data. Minimum 10 samples required.'
            }), 400
        
        detector.train(training_data)
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'samples_used': len(training_data)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze-pattern', methods=['POST'])
def analyze_pattern():
    """Analyze access patterns for a specific user"""
    try:
        user_logs = request.json.get('logs', [])
        
        if not user_logs:
            return jsonify({'error': 'No logs provided'}), 400
        
        # Analyze patterns
        hours = [datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00')).hour 
                for log in user_logs]
        actions = [log.get('action') for log in user_logs]
        
        pattern_analysis = {
            'total_activities': len(user_logs),
            'most_active_hour': max(set(hours), key=hours.count),
            'activity_distribution': {
                'morning': sum(1 for h in hours if 6 <= h < 12),
                'afternoon': sum(1 for h in hours if 12 <= h < 18),
                'evening': sum(1 for h in hours if 18 <= h < 22),
                'night': sum(1 for h in hours if h < 6 or h >= 22)
            },
            'top_actions': {action: actions.count(action) for action in set(actions)},
            'anomalies_detected': []
        }
        
        # Check each log for anomalies
        for log in user_logs:
            result = detector.predict(log)
            if result['is_anomaly']:
                pattern_analysis['anomalies_detected'].append({
                    'timestamp': log['timestamp'],
                    'action': log.get('action'),
                    'risk_score': result['risk_score']
                })
        
        return jsonify({
            'success': True,
            'data': pattern_analysis
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Run Flask app
    port = int(os.environ.get('FLASK_PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
