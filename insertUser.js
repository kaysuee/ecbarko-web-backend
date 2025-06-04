// insertUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/superAdminModels/saAdmin.model.js'; // adjust path if needed

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log('✅ Connected to MongoDB');

    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'super1234',  // Not encrypted on purpose
      role: 'Super Admin',
      adminId: 'A120',
      status: 'active'
      // No shippingLines, since role is Super Admin
    });

    const savedUser = await superAdmin.save();
    console.log('✅ SuperAdmin user inserted:');
    console.log(savedUser);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error inserting SuperAdmin:', err.message);
    process.exit(1);
  }
};

run();
