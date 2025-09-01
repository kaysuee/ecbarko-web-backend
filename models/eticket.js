import mongoose from 'mongoose';
const passengerSchema = new mongoose.Schema({
    name: String,
    contact: String
  });

  const vehicleSchema = new mongoose.Schema({
    plateNumber: String,
    carType: String,
    vehicleOwner: String,
  });
const EticketSchema = new mongoose.Schema({
    passengers: [passengerSchema],
    departureLocation: String,
    arrivalLocation: String,
    departDate: String,
    departTime: String,
    arriveDate: String,
    arriveTime: String,
    shippingLine: String,
    hasVehicle: Boolean,
    selectedCardType: String,
    vehicleDetail: [vehicleSchema],
    bookingReference: String,
    status: { type: String, default: 'active' },
    totalFare: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
}, {timestamps: true,
  collection: 'eticket'  // Explicitly define collection name
});

export default mongoose.model('Eticket', EticketSchema);
