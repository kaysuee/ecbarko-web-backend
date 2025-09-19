import mongoose from "mongoose";

const DbCon = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,  
      useUnifiedTopology: true,  
    });
    console.log("✅ MongoDB is connected");
  } catch (error) {
    console.log("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default DbCon;
