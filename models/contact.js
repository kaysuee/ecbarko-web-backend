import mongoose from "mongoose";


const ContactUsSchema = new mongoose.Schema({

  contactNumber: { type: String, default: "09614505935" },
  contactEmail: { type: String, default: "ecbarkoportal@gmail.com" },
  
});

export default mongoose.model("Contact", ContactUsSchema);
