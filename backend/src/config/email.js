const nodemailer = require('nodemailer');

// Email configuration - Create transporter only if credentials are available
let transporter = null;

try {
  if (process.env.SMTP_USER || process.env.SMTP_EMAIL) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });
    console.log('✅ Email transporter configured successfully');
  } else {
    console.log('⚠️  Email service not configured - emails will not be sent');
  }
} catch (error) {
  console.error('❌ Email transporter configuration error:', error.message);
}

// Send email function
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log('⚠️  Email not sent (transporter not configured):', { to, subject });
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Secure Healthcare" <${process.env.SMTP_USER || process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // Don't throw - just log and continue
    return null;
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔐 Secure Healthcare</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Hello ${name}!</h2>
        <p style="font-size: 16px; color: #666;">Thank you for registering with Secure Healthcare Platform.</p>
        <p style="font-size: 16px; color: #666;">Your One-Time Password (OTP) for verification is:</p>
        <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 10px;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #999;">This OTP will expire in 10 minutes.</p>
        <p style="font-size: 14px; color: #999;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">🔒 HIPAA & GDPR Compliant | End-to-End Encrypted</p>
      </div>
    </div>
  `;
  return sendEmail(email, 'Verify Your Account - Healthcare Platform', html);
};

// Send anomaly alert email
const sendAnomalyAlert = async (adminEmail, details) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc3545; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Security Alert</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #dc3545;">Suspicious Activity Detected!</h2>
        <p style="font-size: 16px; color: #666;">An anomaly has been detected in the system:</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0;">
          <p><strong>User:</strong> ${details.userName} (${details.userEmail})</p>
          <p><strong>Activity:</strong> ${details.activity}</p>
          <p><strong>Risk Score:</strong> ${details.riskScore}/100</p>
          <p><strong>IP Address:</strong> ${details.ipAddress}</p>
          <p><strong>Time:</strong> ${new Date(details.timestamp).toLocaleString()}</p>
          <p><strong>Reason:</strong> ${details.reason}</p>
        </div>
        <p style="font-size: 14px; color: #666;">Please investigate this activity immediately.</p>
        <a href="${process.env.CORS_ORIGIN}/admin/audit-logs" 
           style="display: inline-block; background: #dc3545; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; margin-top: 20px;">
          View Audit Logs
        </a>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">Automated Security Alert System</p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, '⚠️ SECURITY ALERT - Suspicious Activity Detected', html);
};

// Send login notification email
const sendLoginNotification = async (email, name, details) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #28a745; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔐 Login Notification</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Hello ${name}!</h2>
        <p style="font-size: 16px; color: #666;">Your account was just accessed.</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p><strong>Time:</strong> ${new Date(details.timestamp).toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${details.ipAddress}</p>
          <p><strong>Browser:</strong> ${details.userAgent}</p>
        </div>
        <p style="font-size: 14px; color: #666;">If this wasn't you, please secure your account immediately.</p>
      </div>
    </div>
  `;
  return sendEmail(email, 'New Login to Your Healthcare Account', html);
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendAnomalyAlert,
  sendLoginNotification,
};
