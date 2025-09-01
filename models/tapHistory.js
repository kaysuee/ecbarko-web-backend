import mongoose from "mongoose";

const TapHistorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cardNo: { type: String, required: true },
    vehicleType: { type: String, default: "Unknown" },
    hasActiveBooking: { type: Boolean, required: true },
    from: { type: String, default: null },
    to: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Not Applicable", "Insufficient Balance", "Declined", "Unknown"],
      default: "Unknown",
    },
    amount: { type: Number, default: 0 },
    clientTimestamp: { type: Date, default: null }, // frontend/device time
  },
  { timestamps: true } // gives createdAt, updatedAt
);

export default mongoose.model("TapHistory", TapHistorySchema);
