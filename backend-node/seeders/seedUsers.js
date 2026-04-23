const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brgy_management';

const users = [
  {
    name: 'Administrator',
    email: 'admin@admin.com',
    password: 'admin',
    role: 'admin'
  },
  {
    name: 'Alrajie Diamla',
    email: 'alrajiediamla12@gmail.com',
    password: '1234',
    role: 'admin'
  },
  {
    name: 'Kap. Maria Dela Cruz',
    email: 'admin@brgy853.ph',
    password: 'password',
    role: 'admin'
  },
  {
    name: 'Staff Juan',
    email: 'staff@brgy853.ph',
    password: 'password',
    role: 'staff'
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional)
    // await User.deleteMany({});

    // Insert users
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedUsers();

