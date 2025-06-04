import mongoose from "mongoose";

const AboutEBCSchema = new mongoose.Schema({
  aboutEBCTextSection: { type: String, default: "We ensure each passenger..." },
  aboutEBCAddress: { type: String, default: "Welcome to our website!" },

});

export default mongoose.model("AboutEBC", AboutEBCSchema);
