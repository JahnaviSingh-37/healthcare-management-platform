const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Vital signs
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        default: 'breaths/min'
      }
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    bloodGlucose: {
      value: Number,
      unit: {
        type: String,
        default: 'mg/dL'
      }
    },
    // Calculated fields
    bmi: {
      type: Number
    },
    recordDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    notes: String,
    isAbnormal: {
      type: Boolean,
      default: false
    },
    abnormalityFlags: [String],
    // Location/context
    recordedAt: {
      type: String,
      enum: ['hospital', 'clinic', 'home', 'emergency', 'other'],
      default: 'clinic'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
vitalsSchema.index({ patient: 1, recordDate: -1 });
vitalsSchema.index({ recordedBy: 1 });

// Pre-save middleware to calculate BMI
vitalsSchema.pre('save', function(next) {
  if (this.weight?.value && this.height?.value) {
    // Convert to metric if needed
    let weightKg = this.weight.value;
    let heightM = this.height.value / 100; // cm to m
    
    if (this.weight.unit === 'lbs') {
      weightKg = this.weight.value * 0.453592;
    }
    
    if (this.height.unit === 'inches') {
      heightM = (this.height.value * 2.54) / 100;
    }
    
    this.bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  }
  
  // Check for abnormal values and set flags
  this.checkAbnormalities();
  
  next();
});

// Method to check for abnormal values
vitalsSchema.methods.checkAbnormalities = function() {
  const flags = [];
  
  // Heart rate (normal: 60-100 bpm)
  if (this.heartRate?.value) {
    if (this.heartRate.value < 60) flags.push('Low heart rate (Bradycardia)');
    if (this.heartRate.value > 100) flags.push('High heart rate (Tachycardia)');
  }
  
  // Blood pressure (normal: 120/80 mmHg)
  if (this.bloodPressure?.systolic && this.bloodPressure?.diastolic) {
    if (this.bloodPressure.systolic >= 140 || this.bloodPressure.diastolic >= 90) {
      flags.push('High blood pressure (Hypertension)');
    }
    if (this.bloodPressure.systolic < 90 || this.bloodPressure.diastolic < 60) {
      flags.push('Low blood pressure (Hypotension)');
    }
  }
  
  // Temperature (normal: 36.1-37.2°C or 97-99°F)
  if (this.temperature?.value) {
    const temp = this.temperature.unit === 'fahrenheit' 
      ? (this.temperature.value - 32) * 5/9 
      : this.temperature.value;
    
    if (temp < 36.1) flags.push('Low temperature (Hypothermia)');
    if (temp > 37.2) flags.push('High temperature (Fever)');
  }
  
  // Oxygen saturation (normal: 95-100%)
  if (this.oxygenSaturation?.value) {
    if (this.oxygenSaturation.value < 95) flags.push('Low oxygen saturation (Hypoxemia)');
  }
  
  // BMI (normal: 18.5-24.9)
  if (this.bmi) {
    if (this.bmi < 18.5) flags.push('Underweight');
    if (this.bmi >= 25 && this.bmi < 30) flags.push('Overweight');
    if (this.bmi >= 30) flags.push('Obese');
  }
  
  this.abnormalityFlags = flags;
  this.isAbnormal = flags.length > 0;
};

// Static method to get vitals trend
vitalsSchema.statics.getVitalsTrend = async function(patientId, vitalType, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.find({
    patient: patientId,
    recordDate: { $gte: startDate },
    [vitalType]: { $exists: true }
  })
  .select(`${vitalType} recordDate`)
  .sort({ recordDate: 1 });
};

// Static method to get latest vitals
vitalsSchema.statics.getLatestVitals = async function(patientId) {
  return await this.findOne({ patient: patientId })
    .sort({ recordDate: -1 })
    .populate('recordedBy', 'firstName lastName role');
};

const Vitals = mongoose.model('Vitals', vitalsSchema);

module.exports = Vitals;
