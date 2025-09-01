import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: String,
  userId: String,
  rfid: String,
  vehicleType: String,
  category: String,
  status: String,
  lastActive: Date,
  bookingid: String,
  shippingline: String,
}, {
  timestamps: true 
});

export default mongoose.model('Vehicle', vehicleSchema, 'vehicle');
