const crypto = require('crypto');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../config/email');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Create and send OTP
const createAndSendOTP = async (email, purpose, userName) => {
  try {
    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP via email
    await sendOTPEmail(email, otp, userName);

    return { success: true };
  } catch (error) {
    console.error('OTP creation error:', error);
    throw new Error('Failed to send OTP');
  }
};

// Verify OTP
const verifyOTP = async (email, otp, purpose) => {
  try {
    const otpDoc = await OTP.findOne({
      email,
      purpose,
      verified: false,
    });

    if (!otpDoc) {
      return { success: false, message: 'OTP not found or already verified' };
    }

    // Check if OTP is expired
    if (otpDoc.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return { success: false, message: 'OTP has expired' };
    }

    // Check attempts
    if (otpDoc.attempts >= 5) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return { success: false, message: 'Maximum verification attempts exceeded' };
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      // Increment attempts
      otpDoc.attempts += 1;
      await otpDoc.save();
      return { success: false, message: 'Invalid OTP', attemptsLeft: 5 - otpDoc.attempts };
    }

    // Mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('OTP verification error:', error);
    throw new Error('Failed to verify OTP');
  }
};

// Resend OTP
const resendOTP = async (email, purpose, userName) => {
  try {
    // Delete existing OTP
    await OTP.deleteMany({ email, purpose });

    // Create and send new OTP
    return await createAndSendOTP(email, purpose, userName);
  } catch (error) {
    console.error('OTP resend error:', error);
    throw new Error('Failed to resend OTP');
  }
};

module.exports = {
  generateOTP,
  createAndSendOTP,
  verifyOTP,
  resendOTP,
};
