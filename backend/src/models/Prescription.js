const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    medications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true,
        enum: ['once daily', 'twice daily', 'three times daily', 'four times daily', 'every 4 hours', 'every 6 hours', 'every 8 hours', 'as needed', 'before meals', 'after meals', 'at bedtime']
      },
      duration: {
        value: Number,
        unit: {
          type: String,
          enum: ['days', 'weeks', 'months', 'years']
        }
      },
      instructions: String,
      refills: {
        type: Number,
        default: 0
      }
    }],
    labTests: [{
      name: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
      },
      results: String,
      date: Date
    }],
    followUpDate: Date,
    notes: String,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    validUntil: Date,
    pharmacyNotes: String,
    issuedAt: {
      type: Date,
      default: Date.now
    },
    signature: {
      doctorName: String,
      licenseNumber: String,
      digitalSignature: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });

// Virtual for prescription ID
prescriptionSchema.virtual('prescriptionId').get(function() {
  return `RX-${this._id.toString().slice(-8).toUpperCase()}`;
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
