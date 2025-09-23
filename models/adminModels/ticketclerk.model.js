import mongoose from 'mongoose';

const ticketClerkSchema = new mongoose.Schema({
  name: String,
  clerkId: String,
  email: String,
  password: String,
  status: { 
    type: String, 
    enum: ['active', 'deactivated', 'inactive'], // Add 'inactive' here
    default: 'inactive' // Set default to 'inactive' for new accounts
  },
  reason: { type: String, default: '' },
}, {
  timestamps: true,
});

export default mongoose.model('TicketClerk', ticketClerkSchema, 'ticketclerk');