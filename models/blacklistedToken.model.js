import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  blacklistedAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Token expires in 7 days (same as JWT expiry)
  }
});

// Index for efficient queries
blacklistedTokenSchema.index({ userId: 1 });

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);