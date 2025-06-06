import mongoose from 'mongoose';

const ticketClerkSchema = new mongoose.Schema({
  name: String,
  clerkId: String,
  email: String,
  password: String,
  status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
  reason: { type: String, default: '' },
}, {
  timestamps: true,
});

export default mongoose.model('TicketClerk', ticketClerkSchema, 'ticketclerk');
