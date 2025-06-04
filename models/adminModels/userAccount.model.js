import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
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
