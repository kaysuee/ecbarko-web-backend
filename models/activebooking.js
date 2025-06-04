import mongoose from "mongoose";

const ActiveBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookingId: { type: String, required: true },
  departureLocation: { type: String, required: true },
  arrivalLocation: { type: String, required: true },
  departDate: { type: Date, required: true },
  departTime: { type: String, required: true },
  passengers: { type: Number, required: true },
  hasVehicle: { type: Boolean, default: false },
  vehicleType: { type: String, default: '' },
  status: { type: String, default: 'active' },
  shippingLine: { type: String, required: true },
  departurePort: { type: String, required: true },
  arrivalPort: { type: String, required: true },
  payment: { type: Number, required: true },
  isPaid: { type: String, required: true, default: 'active' },
}, {
  timestamps: true,
  collection: 'activebooking'
});

const ActiveBookingModel = mongoose.models.activebooking || mongoose.model('activebooking', ActiveBookingSchema);

export default ActiveBookingModel;
