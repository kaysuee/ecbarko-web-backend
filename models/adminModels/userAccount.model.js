import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: {
  type: String,
  required: true,
  match: [/^09\d{9}$/, 'Phone number must be in the format 09XXXXXXXXX (11 digits)']
  },
  password: String,
  birthdate: String,
  profileImageUrl: String,
  type: String,
  status: { type: String, default: 'active' },
  lastActive: String
}, {
  timestamps: true 
});

export default mongoose.model('UserAccount', userSchema, 'userAccounts');
