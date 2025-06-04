import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: String,
  userId: String,
  rfid: String,
  vehicleType: String,
  category: String,
  status: String,
  lastActive: Date,
}, {
  timestamps: true 
});

export default mongoose.model('Vehicle', vehicleSchema, 'vehicle');
