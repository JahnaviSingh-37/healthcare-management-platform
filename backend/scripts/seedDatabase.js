const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const HealthRecord = require('../src/models/HealthRecord');
const Prescription = require('../src/models/Prescription');
const Appointment = require('../src/models/Appointment');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Real Doctor Data (Medical Professionals)
const doctorData = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'dr.sarah.johnson@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0101',
    dateOfBirth: '1978-05-15',
    gender: 'female',
    role: 'doctor',
    specialization: 'Cardiologist',
    licenseNumber: 'MD-CA-45678',
    address: '123 Medical Plaza, Los Angeles, CA 90001'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'dr.michael.chen@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0102',
    dateOfBirth: '1982-08-22',
    gender: 'male',
    role: 'doctor',
    specialization: 'Neurologist',
    licenseNumber: 'MD-NY-89012',
    address: '456 Brain Institute, New York, NY 10001'
  },
  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'dr.emily.rodriguez@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0103',
    dateOfBirth: '1985-03-10',
    gender: 'female',
    role: 'doctor',
    specialization: 'Pediatrician',
    licenseNumber: 'MD-TX-34567',
    address: '789 Children Hospital, Houston, TX 77001'
  },
  {
    firstName: 'David',
    lastName: 'Patel',
    email: 'dr.david.patel@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0104',
    dateOfBirth: '1980-11-30',
    gender: 'male',
    role: 'doctor',
    specialization: 'Orthopedic Surgeon',
    licenseNumber: 'MD-FL-67890',
    address: '321 Bone & Joint Center, Miami, FL 33101'
  },
  {
    firstName: 'Lisa',
    lastName: 'Williams',
    email: 'dr.lisa.williams@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0105',
    dateOfBirth: '1979-07-18',
    gender: 'female',
    role: 'doctor',
    specialization: 'Dermatologist',
    licenseNumber: 'MD-WA-23456',
    address: '654 Skin Care Clinic, Seattle, WA 98101'
  },
  {
    firstName: 'James',
    lastName: 'Anderson',
    email: 'dr.james.anderson@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0106',
    dateOfBirth: '1976-12-05',
    gender: 'male',
    role: 'doctor',
    specialization: 'Oncologist',
    licenseNumber: 'MD-MA-78901',
    address: '987 Cancer Treatment Center, Boston, MA 02101'
  },
  {
    firstName: 'Rachel',
    lastName: 'Kim',
    email: 'dr.rachel.kim@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0107',
    dateOfBirth: '1983-09-25',
    gender: 'female',
    role: 'doctor',
    specialization: 'Gynecologist',
    licenseNumber: 'MD-IL-45612',
    address: '159 Women\'s Health Center, Chicago, IL 60601'
  },
  {
    firstName: 'Robert',
    lastName: 'Martinez',
    email: 'dr.robert.martinez@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0108',
    dateOfBirth: '1981-04-14',
    gender: 'male',
    role: 'doctor',
    specialization: 'Psychiatrist',
    licenseNumber: 'MD-CO-90123',
    address: '753 Mental Health Clinic, Denver, CO 80201'
  },
  {
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'dr.amanda.taylor@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0109',
    dateOfBirth: '1984-06-20',
    gender: 'female',
    role: 'doctor',
    specialization: 'Ophthalmologist',
    licenseNumber: 'MD-AZ-56789',
    address: '852 Eye Care Center, Phoenix, AZ 85001'
  },
  {
    firstName: 'Christopher',
    lastName: 'Brown',
    email: 'dr.christopher.brown@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0110',
    dateOfBirth: '1977-02-08',
    gender: 'male',
    role: 'doctor',
    specialization: 'Gastroenterologist',
    licenseNumber: 'MD-PA-12345',
    address: '456 Digestive Health Institute, Philadelphia, PA 19101'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'dr.jennifer.davis@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0111',
    dateOfBirth: '1986-10-12',
    gender: 'female',
    role: 'doctor',
    specialization: 'Endocrinologist',
    licenseNumber: 'MD-GA-67823',
    address: '789 Diabetes & Thyroid Clinic, Atlanta, GA 30301'
  },
  {
    firstName: 'William',
    lastName: 'Wilson',
    email: 'dr.william.wilson@healthcare.com',
    password: 'Doctor@123',
    phone: '+1-555-0112',
    dateOfBirth: '1975-01-28',
    gender: 'male',
    role: 'doctor',
    specialization: 'Pulmonologist',
    licenseNumber: 'MD-NC-34589',
    address: '321 Lung & Respiratory Center, Charlotte, NC 28201'
  },
  // Indian Doctors
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'dr.rajesh.kumar@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543210',
    dateOfBirth: '1980-04-15',
    gender: 'male',
    role: 'doctor',
    specialization: 'Cardiologist',
    licenseNumber: 'IMC-MH-78945',
    address: 'Apollo Hospital, Andheri, Mumbai, Maharashtra 400053'
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'dr.priya.sharma@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543211',
    dateOfBirth: '1983-08-22',
    gender: 'female',
    role: 'doctor',
    specialization: 'Neurologist',
    licenseNumber: 'IMC-DL-56789',
    address: 'Max Hospital, Saket, New Delhi 110017'
  },
  {
    firstName: 'Arjun',
    lastName: 'Reddy',
    email: 'dr.arjun.reddy@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543212',
    dateOfBirth: '1978-12-10',
    gender: 'male',
    role: 'doctor',
    specialization: 'Orthopedic Surgeon',
    licenseNumber: 'IMC-KA-34512',
    address: 'Manipal Hospital, Whitefield, Bangalore, Karnataka 560066'
  },
  {
    firstName: 'Anjali',
    lastName: 'Patel',
    email: 'dr.anjali.patel@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543213',
    dateOfBirth: '1985-06-18',
    gender: 'female',
    role: 'doctor',
    specialization: 'Gynecologist',
    licenseNumber: 'IMC-GJ-67823',
    address: 'Sterling Hospital, Gurukul, Ahmedabad, Gujarat 380052'
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'dr.vikram.singh@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543214',
    dateOfBirth: '1982-03-25',
    gender: 'male',
    role: 'doctor',
    specialization: 'Pediatrician',
    licenseNumber: 'IMC-TN-89012',
    address: 'Fortis Malar Hospital, Adyar, Chennai, Tamil Nadu 600020'
  },
  {
    firstName: 'Kavita',
    lastName: 'Desai',
    email: 'dr.kavita.desai@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543215',
    dateOfBirth: '1979-11-30',
    gender: 'female',
    role: 'doctor',
    specialization: 'Dermatologist',
    licenseNumber: 'IMC-MH-23456',
    address: 'Kokilaben Hospital, Andheri, Mumbai, Maharashtra 400059'
  },
  {
    firstName: 'Amit',
    lastName: 'Verma',
    email: 'dr.amit.verma@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543216',
    dateOfBirth: '1981-09-14',
    gender: 'male',
    role: 'doctor',
    specialization: 'Oncologist',
    licenseNumber: 'IMC-UP-45678',
    address: 'Medanta Hospital, Sector 38, Gurugram, Haryana 122001'
  },
  {
    firstName: 'Sneha',
    lastName: 'Iyer',
    email: 'dr.sneha.iyer@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543217',
    dateOfBirth: '1984-05-20',
    gender: 'female',
    role: 'doctor',
    specialization: 'Psychiatrist',
    licenseNumber: 'IMC-KA-90123',
    address: 'NIMHANS, Bangalore, Karnataka 560029'
  },
  {
    firstName: 'Rohit',
    lastName: 'Chopra',
    email: 'dr.rohit.chopra@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543218',
    dateOfBirth: '1977-02-08',
    gender: 'male',
    role: 'doctor',
    specialization: 'Gastroenterologist',
    licenseNumber: 'IMC-WB-12345',
    address: 'AMRI Hospital, Salt Lake, Kolkata, West Bengal 700091'
  },
  {
    firstName: 'Meera',
    lastName: 'Nair',
    email: 'dr.meera.nair@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543219',
    dateOfBirth: '1986-07-16',
    gender: 'female',
    role: 'doctor',
    specialization: 'Endocrinologist',
    licenseNumber: 'IMC-KL-56789',
    address: 'Aster Medcity, Kochi, Kerala 682027'
  },
  {
    firstName: 'Aditya',
    lastName: 'Malhotra',
    email: 'dr.aditya.malhotra@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543220',
    dateOfBirth: '1983-10-12',
    gender: 'male',
    role: 'doctor',
    specialization: 'Pulmonologist',
    licenseNumber: 'IMC-RJ-78901',
    address: 'Fortis Escorts Hospital, Jaipur, Rajasthan 302017'
  },
  {
    firstName: 'Divya',
    lastName: 'Menon',
    email: 'dr.divya.menon@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543221',
    dateOfBirth: '1980-01-28',
    gender: 'female',
    role: 'doctor',
    specialization: 'Ophthalmologist',
    licenseNumber: 'IMC-TG-34567',
    address: 'L V Prasad Eye Institute, Hyderabad, Telangana 500034'
  },
  {
    firstName: 'Karan',
    lastName: 'Kapoor',
    email: 'dr.karan.kapoor@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543222',
    dateOfBirth: '1979-11-05',
    gender: 'male',
    role: 'doctor',
    specialization: 'Urologist',
    licenseNumber: 'IMC-PB-67890',
    address: 'Fortis Hospital, Mohali, Punjab 160062'
  },
  {
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'dr.neha.gupta@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543223',
    dateOfBirth: '1987-04-22',
    gender: 'female',
    role: 'doctor',
    specialization: 'Rheumatologist',
    licenseNumber: 'IMC-MH-90123',
    address: 'Ruby Hall Clinic, Pune, Maharashtra 411001'
  },
  {
    firstName: 'Suresh',
    lastName: 'Rao',
    email: 'dr.suresh.rao@healthcare.com',
    password: 'Doctor@123',
    phone: '+91-9876543224',
    dateOfBirth: '1976-09-18',
    gender: 'male',
    role: 'doctor',
    specialization: 'Nephrologist',
    licenseNumber: 'IMC-TN-45612',
    address: 'Apollo Hospital, Greams Road, Chennai, Tamil Nadu 600006'
  }
];

// Patient Data
const patientData = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    password: 'Patient@123',
    phone: '+1-555-0201',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    role: 'patient',
    address: '123 Main St, Los Angeles, CA 90001'
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    password: 'Patient@123',
    phone: '+1-555-0202',
    dateOfBirth: '1988-07-22',
    gender: 'female',
    role: 'patient',
    address: '456 Oak Ave, New York, NY 10001'
  },
  {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@email.com',
    password: 'Patient@123',
    phone: '+1-555-0203',
    dateOfBirth: '1992-11-08',
    gender: 'male',
    role: 'patient',
    address: '789 Elm St, Houston, TX 77001'
  },
  {
    firstName: 'Linda',
    lastName: 'Miller',
    email: 'linda.miller@email.com',
    password: 'Patient@123',
    phone: '+1-555-0204',
    dateOfBirth: '1985-05-19',
    gender: 'female',
    role: 'patient',
    address: '321 Pine Rd, Miami, FL 33101'
  },
  {
    firstName: 'James',
    lastName: 'Davis',
    email: 'james.davis@email.com',
    password: 'Patient@123',
    phone: '+1-555-0205',
    dateOfBirth: '1995-09-30',
    gender: 'male',
    role: 'patient',
    address: '654 Maple Dr, Seattle, WA 98101'
  }
];

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/healthcare_db';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ email: { $regex: '@healthcare.com|@email.com' } });
    await HealthRecord.deleteMany({});
    await Prescription.deleteMany({});
    await Appointment.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Doctor@123', salt);

    // Create Doctors
    console.log('👨‍⚕️ Creating doctors...');
    const doctors = [];
    for (const doc of doctorData) {
      const doctor = await User.create({
        ...doc,
        password: hashedPassword,
        isVerified: true
      });
      doctors.push(doctor);
      console.log(`   ✓ Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
    }
    console.log(`✅ ${doctors.length} doctors created\n`);

    // Create Patients
    console.log('👥 Creating patients...');
    const patients = [];
    for (const pat of patientData) {
      const patient = await User.create({
        ...pat,
        password: hashedPassword,
        isVerified: true
      });
      patients.push(patient);
      console.log(`   ✓ ${patient.firstName} ${patient.lastName}`);
    }
    console.log(`✅ ${patients.length} patients created\n`);

    // Create Health Records
    console.log('📋 Creating health records...');
    const healthRecords = [];
    
    const healthRecordTemplates = [
      {
        recordType: 'consultation',
        diagnosis: 'Hypertension',
        symptoms: 'High blood pressure, Headaches, Dizziness',
        treatment: 'Prescribed Lisinopril 10mg daily, advised low-sodium diet and regular exercise',
        notes: 'Patient advised to monitor blood pressure daily and return for follow-up in 2 weeks'
      },
      {
        recordType: 'lab_result',
        diagnosis: 'Type 2 Diabetes',
        symptoms: 'Increased thirst, Frequent urination, Fatigue',
        treatment: 'Metformin 500mg twice daily, dietary counseling scheduled',
        notes: 'HbA1c: 7.2%. Patient educated on blood glucose monitoring.'
      },
      {
        recordType: 'consultation',
        diagnosis: 'Seasonal Allergies',
        symptoms: 'Sneezing, Runny nose, Itchy eyes',
        treatment: 'Cetirizine 10mg once daily as needed',
        notes: 'Advised to avoid known allergens, follow up if symptoms persist'
      },
      {
        recordType: 'procedure',
        diagnosis: 'Fractured Left Radius',
        symptoms: 'Pain in left wrist, Swelling, Limited mobility',
        treatment: 'Cast applied, pain management with ibuprofen',
        notes: 'Follow-up X-ray scheduled in 6 weeks. Physical therapy recommended after cast removal.'
      }
    ];

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const doctor = doctors[i % doctors.length];
      const template = healthRecordTemplates[i % healthRecordTemplates.length];
      
      const record = await HealthRecord.create({
        patient: patient._id,
        doctor: doctor._id,
        ...template,
        recordDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });
      
      healthRecords.push(record);
      console.log(`   ✓ Record for ${patient.firstName} ${patient.lastName} by Dr. ${doctor.lastName}`);
    }
    console.log(`✅ ${healthRecords.length} health records created\n`);

    // Create Sample Prescriptions
    console.log('💊 Creating prescriptions...');
    for (let i = 0; i < Math.min(3, patients.length); i++) {
      const patient = patients[i];
      const doctor = doctors[i];
      
      const prescription = await Prescription.create({
        patient: patient._id,
        doctor: doctor._id,
        diagnosis: healthRecordTemplates[i].diagnosis,
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'once daily',
            duration: { value: 30, unit: 'days' },
            instructions: 'Take with food in the morning',
            refills: 3
          }
        ],
        status: 'active',
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        signature: {
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          licenseNumber: doctor.licenseNumber,
          digitalSignature: `DS-${Date.now()}-${doctor._id.toString().slice(-6)}`
        }
      });
      
      console.log(`   ✓ Prescription for ${patient.firstName} ${patient.lastName}`);
    }
    console.log(`✅ Prescriptions created\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE SEEDING COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`   👥 Patients: ${patients.length}`);
    console.log(`   📋 Health Records: ${healthRecords.length}`);
    console.log(`   💊 Prescriptions: 3`);
    console.log('\n🔐 Login Credentials:');
    console.log('   All passwords: Doctor@123 or Patient@123');
    console.log('\n👨‍⚕️ Sample Doctor Logins:');
    doctors.slice(0, 3).forEach(doc => {
      console.log(`   📧 ${doc.email}`);
      console.log(`   🏥 ${doc.specialization}\n`);
    });
    console.log('👥 Sample Patient Logins:');
    patients.slice(0, 2).forEach(pat => {
      console.log(`   📧 ${pat.email}\n`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
};

runSeeder();
