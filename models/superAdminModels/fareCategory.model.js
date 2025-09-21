import mongoose from 'mongoose';

const passengerFareSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  passengerType: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  ageRange: { type: String },
  minAge: { type: Number },
  maxAge: { type: Number },
  discount: { type: Number, default: 0 },
  discountPercentage: { type: Number },
  requirements: { type: String },
  isActive: { type: Boolean, default: true },
  route: { type: String, default: 'default' },
}, { timestamps: true, collection: 'passenger_fare_data' });

const PassengerFare = mongoose.model('PassengerFare', passengerFareSchema);

export default PassengerFare;
