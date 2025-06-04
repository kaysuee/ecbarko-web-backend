import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  name: String,
  id: String,
  cardNumber: String,
  balance: String,
  type: String,
  status: String,
  lastActive: String
}, {
  timestamps: true 
});

export default mongoose.model('Card', cardSchema, 'card');
