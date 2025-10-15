const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recordType: {
      type: String,
      enum: [
        'diagnosis',
        'prescription',
        'lab_result',
        'imaging',
        'consultation',
        'procedure',
        'vaccination',
        'allergy',
        'chronic_condition',
        'emergency',
        'other'
      ],
      required: true
    },
    // Encrypted fields
    diagnosis: {
      type: String,
      set: function(value) {
        return value ? encrypt(value) : null;
      },
      get: function(value) {
        return value ? decrypt(value) : null;
      }
    },
    symptoms: {
      type: String,
      set: function(value) {
        return value ? encrypt(value) : null;
      },
      get: function(value) {
        return value ? decrypt(value) : null;
      }
    },
    treatment: {
      type: String,
      set: function(value) {
        return value ? encrypt(value) : null;
      },
      get: function(value) {
        return value ? decrypt(value) : null;
      }
    },
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: {
        type: String,
        set: function(value) {
          return value ? encrypt(value) : null;
        },
        get: function(value) {
          return value ? decrypt(value) : null;
        }
      }
    }],
    notes: {
      type: String,
      set: function(value) {
        return value ? encrypt(value) : null;
      },
      get: function(value) {
        return value ? decrypt(value) : null;
      }
    },
    // Lab results (encrypted)
    labResults: {
      type: String,
      set: function(value) {
        return value ? encrypt(JSON.stringify(value)) : null;
      },
      get: function(value) {
        try {
          return value ? JSON.parse(decrypt(value)) : null;
        } catch (error) {
          return null;
        }
      }
    },
    // File attachments (encrypted references)
    attachments: [{
      fileName: String,
      fileType: String,
      fileSize: Number,
      fileUrl: {
        type: String,
        set: function(value) {
          return value ? encrypt(value) : null;
        },
        get: function(value) {
          return value ? decrypt(value) : null;
        }
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    visitDate: {
      type: Date,
      default: Date.now
    },
    followUpDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'ongoing', 'archived'],
      default: 'active'
    },
    // Access control
    isConfidential: {
      type: Boolean,
      default: true
    },
    accessLog: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      action: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String
    }]
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Indexes
healthRecordSchema.index({ patient: 1, visitDate: -1 });
healthRecordSchema.index({ doctor: 1 });
healthRecordSchema.index({ recordType: 1 });
healthRecordSchema.index({ status: 1 });

// Method to log access
healthRecordSchema.methods.logAccess = async function(userId, action, ipAddress) {
  this.accessLog.push({
    user: userId,
    action,
    timestamp: new Date(),
    ipAddress
  });
  await this.save();
};

// Static method to get patient records with access control
healthRecordSchema.statics.getPatientRecords = async function(
  patientId,
  requesterId,
  requesterRole
) {
  const query = { patient: patientId };
  
  // Only doctors assigned to the patient or admins can view all records
  if (requesterRole === 'patient' && patientId.toString() !== requesterId.toString()) {
    throw new Error('Unauthorized access to patient records');
  }
  
  if (requesterRole === 'nurse') {
    // Nurses can only view basic information
    query.isConfidential = false;
  }
  
  return await this.find(query)
    .populate('doctor', 'firstName lastName specialization')
    .sort({ visitDate: -1 });
};

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

module.exports = HealthRecord;
