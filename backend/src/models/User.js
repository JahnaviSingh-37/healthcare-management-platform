const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: function() {
        // Password not required for OAuth users
        return !this.isOAuthUser;
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'nurse', 'admin'],
      default: 'patient'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    // MFA Configuration
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaSecret: {
      type: String,
      select: false
    },
    mfaBackupCodes: {
      type: [String],
      select: false
    },
    // Security fields
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    lastLoginIP: String,
    // Profile settings
    profilePicture: String,
    bio: String,
    specialization: {
      type: String,
      required: function() {
        return this.role === 'doctor';
      }
    },
    licenseNumber: {
      type: String,
      required: function() {
        return this.role === 'doctor' || this.role === 'nurse';
      }
    },
    // Assigned relationships
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedPatients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Consent and agreements
    termsAccepted: {
      type: Boolean,
      default: false
    },
    privacyPolicyAccepted: {
      type: Boolean,
      default: false
    },
    dataProcessingConsent: {
      type: Boolean,
      default: false
    },
    consentDate: Date,
    // OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allows null values to be non-unique
    },
    avatar: String,
    isOAuthUser: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes (email is already unique in schema, no need to add index again)
userSchema.index({ role: 1 });
userSchema.index({ assignedDoctor: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update passwordChangedAt field
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account after max attempts
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000; // 15 minutes
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Method to generate MFA secret
userSchema.methods.generateMFASecret = function() {
  const secret = speakeasy.generateSecret({
    name: `${process.env.MFA_ISSUER || 'Healthcare Platform'} (${this.email})`,
    length: 32
  });
  
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url
  };
};

// Method to verify MFA token
userSchema.methods.verifyMFAToken = function(token) {
  return speakeasy.totp.verify({
    secret: this.mfaSecret,
    encoding: 'base32',
    token: token,
    window: parseInt(process.env.MFA_WINDOW) || 1
  });
};

// Method to generate backup codes
userSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.mfaSecret;
  delete user.mfaBackupCodes;
  delete user.verificationToken;
  delete user.passwordResetToken;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
