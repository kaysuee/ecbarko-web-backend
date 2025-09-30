import mongoose from 'mongoose';

const ticketClerkSchema = new mongoose.Schema({
  name: String,
  clerkId: String,
  email: { type: String, required: true, unique: true },
  password: String,
  status: { type: String, enum: ['active', 'inactive', 'deactivated'], default: 'inactive' },
  reason: { type: String, default: '' },
  role: { type: String, default: 'ticket clerk' },
  profileImage: { type: String, default: null },
}, {
  timestamps: true,
});

export default mongoose.model('TicketClerk', ticketClerkSchema, 'ticketclerk');
