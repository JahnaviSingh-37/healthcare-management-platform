const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/v1/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user information from Google profile
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        const googleId = profile.id;
        const avatar = profile.photos[0]?.value;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Update Google ID if not set
          if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = avatar;
            await user.save();
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Log OAuth login
          await AuditLog.logAction({
            user: user._id,
            action: 'OAUTH_LOGIN',
            resource: 'Auth',
            details: { provider: 'google', email },
            status: 'success',
          });

          logger.info('User logged in via Google OAuth', {
            userId: user._id,
            email: user.email,
          });

          return done(null, user);
        } else {
          // Create new user with OAuth
          user = await User.create({
            email,
            firstName,
            lastName,
            googleId,
            avatar,
            role: 'patient', // Default role
            termsAccepted: true,
            privacyPolicyAccepted: true,
            dataProcessingConsent: true,
            consentDate: new Date(),
            // No password needed for OAuth users
            isOAuthUser: true,
          });

          // Log new OAuth user creation
          await AuditLog.logAction({
            user: user._id,
            action: 'OAUTH_USER_CREATE',
            resource: 'User',
            resourceId: user._id,
            details: { provider: 'google', email, role: user.role },
            status: 'success',
            dataCategories: ['PII'],
          });

          logger.info('New user created via Google OAuth', {
            userId: user._id,
            email: user.email,
          });

          return done(null, user);
        }
      } catch (error) {
        logger.error('Google OAuth error', { error: error.message });
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
