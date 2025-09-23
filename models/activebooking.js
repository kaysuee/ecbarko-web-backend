import mongoose from "mongoose";

const ActiveBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookingId: { type: String, required: true },
  departureLocation: { type: String, required: true },
  arrivalLocation: { type: String, required: true },
  departDate: { type: Date, required: true },
  departTime: { type: String, required: true },
  arriveDate: { type: String, required: true },
  arriveTime: { type: String, required: true },
  passengers: { type: Number, required: true },
  hasVehicle: { type: Boolean, required: true },
  vehicleType: { type: String },
  status: { type: String, default: 'active' },
  shippingLine: { type: String, required: true },
  schedcde: { type: String, required: true },
  departurePort: { type: String, required: true },
  arrivalPort: { type: String, required: true },
  payment: { type: Number, required: true },
  paymentMethod: { type: String, required: true, default: 'Cash' },
  isPaid: { type: String, required: true, default: 'active' },
  bookingDate: { type: String, required: true },
  
  passengerDetails: [{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    ticketType: { type: String, required: true },
    fare: { type: Number, required: true },
    birthday: { type: String, required: true },
    idNumber: { type: String },
  }],
  vehicleInfo: {
    vehicleCategory: { type: String },
    plateNumber: { type: String },
    vehicleType: { type: String },
  },
}, {
  timestamps: true,
  collection: 'activebooking'
});

const ActiveBookingModel = mongoose.models.activebooking || mongoose.model('activebooking', ActiveBookingSchema);

export default ActiveBookingModel;
