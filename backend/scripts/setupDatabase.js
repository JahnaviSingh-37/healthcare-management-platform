#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const setupDatabase = async () => {
  console.log('🔧 Setting up database...\n');

  try {
    await connectDB();

    // Create collections
    const collections = ['users', 'healthrecords', 'vitals', 'auditlogs'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.createCollection(collection);
        console.log(`✅ Created collection: ${collection}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection already exists: ${collection}`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes
    console.log('\n🔍 Creating indexes...');

    const User = require('../src/models/User');
    const HealthRecord = require('../src/models/HealthRecord');
    const Vitals = require('../src/models/Vitals');
    const AuditLog = require('../src/models/AuditLog');

    await User.createIndexes();
    console.log('✅ User indexes created');

    await HealthRecord.createIndexes();
    console.log('✅ HealthRecord indexes created');

    await Vitals.createIndexes();
    console.log('✅ Vitals indexes created');

    await AuditLog.createIndexes();
    console.log('✅ AuditLog indexes created');

    console.log('\n✨ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
