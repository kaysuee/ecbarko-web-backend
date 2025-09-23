import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Remove the ref constraint to allow both User and TicketClerk IDs
    // ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  // Optional: add a field to track what type of user this token is for
  userType: {
    type: String,
    enum: ['User', 'TicketClerk'],
    default: 'User'
  }
});

export default mongoose.model('Token', tokenSchema);