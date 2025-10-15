const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    appointmentDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 30
    },
    type: {
      type: String,
      enum: ['in-person', 'telemedicine', 'follow-up', 'emergency', 'consultation'],
      default: 'in-person'
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'],
      default: 'scheduled'
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    symptoms: [String],
    notes: String,
    doctorNotes: String,
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    videoRoomId: String, // For telemedicine
    reminderSent: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: String,
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

// Virtual for appointment ID
appointmentSchema.virtual('appointmentId').get(function() {
  return `APT-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to check if appointment slot is available
appointmentSchema.statics.isSlotAvailable = async function(doctorId, date, startTime, endTime, excludeId = null) {
  const query = {
    doctor: doctorId,
    appointmentDate: date,
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gt: startTime } }
        ]
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflicts = await this.find(query);
  return conflicts.length === 0;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
