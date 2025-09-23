import UserModel from "../models/user.js";
import CardModel from "../models/card.js";
import CardHistory from "../models/cardHistory.js";
import Otp from "../models/otp.js";
import ActiveBooking from "../models/activebooking.js";
import Token from "../models/token.model.js";
import TicketClerkModel from "../models/adminModels/ticketclerk.model.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { sendOtpEmail, sendResetEmail } from "../utlis/email.js";
import Taphistory from "../models/tapHistory.js";
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existUser = await UserModel.findOne({ email });
    if (existUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hashSync(password, 10);

    const userRole = role || "ticket clerk";

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    await newUser.save();

    const roleCollections = {
      "ticket clerk": "ticket-clerk", // Collection for ticket clerks
      admin: "admins", // Collection for admins
      "super admin": "super-admin", // Collection for super admins
    };

    // Ensure the role is valid and map it to the correct collection
    if (roleCollections[userRole]) {
      const userFolder = roleCollections[userRole]; // Use this folder name for role-specific data
      return res.status(200).json({
        success: true,
        message: "User registered successfully",
        newUser,
        userFolder, // Optional: Add this to show where the data is saved (for testing purposes)
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    console.log(error);
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try User (admin / super admin)
    let user = await UserModel.findOne({ email });
    let clerk = false;

    // If not found in User, try TicketClerk
    if (!user) {
      user = await TicketClerkModel.findOne({ email });
      clerk = true;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    // Check if deactivated (for clerks)
    if (clerk && user.status === "deactivated") {
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.clearCookie("token");
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ change to true in production with HTTPS
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
      clerk,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



const Logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "user Logout successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal server error" });
    console.log(error);
  }
};
const CheckUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      user = await TicketClerkModel.findById(user._id);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    console.log(error);
  }
};

const getCard = async (req, res) => {
  try {
    const cards = await CardModel.find({ cardNumber: req.params.cardNumber });
    const now = new Date();
    const activebooking = await ActiveBooking.findOne({
      userId: cards[0].userId,
      departDate: { $gt: now },
      isPaid: "false",
    }).sort({ departDate: 1 });
    //console.log("active booking", activebooking);
    if (!cards) {
      return res.status(404).json({ message: "Card not found" });
    }
    if(activebooking){
      activebooking.isPaid = "true";
      activebooking.save();
    }
   
    return res.status(200).json({
      card: cards[0], // send single card
      activebooking: activebooking || null, // null if no upcoming booking
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const payment = async (req, res) => {
  try {
    const { cardNo, payment } = req.body;

    if (!cardNo || !payment) {
      return res
        .status(400)
        .json({ message: "cardNo and payment are required" });
    }

    const cards = await CardModel.find({ cardNumber: cardNo });

    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: "Card not found" });
    }

    const card = cards[0];
    card.balance = Number(card.balance) - Number(payment);
    await card.save(); // save updated balance

    return res.status(200).json({
      card,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const setPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await TicketClerkModel.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.status = "active"; // ✅ account activated
    await user.save();

    // delete token after use
    await Token.deleteOne({ _id: tokenDoc._id });

    res.json({ success: true, message: "Password set successfully, account activated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await TicketClerkModel.findOne({ email });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found with this email address" });
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:5173';
      
    const link = `${baseUrl}/reset-password/${email}`;
    
    await sendResetEmail(email, link);

    res.status(200).json({ 
      success: true,
      message: "Password reset link has been sent to your email" 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again later." 
    });
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  const otpEntry = await Otp.findOne({ otp });

  await Otp.deleteOne({ _id: otpEntry._id });
  res.status(200).json({ verified: true });
};

const savePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await UserModel.findOne({ email });
    console.log("here", user);
    if (!user) {
      user = await TicketClerkModel.findOne({ email });
    }
    user.password = password;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCardHistory = async (req, res) => {
  try {
    const cardHistory = await CardHistory.find({
      userId: req.params.cardNumber,
      type: "Load",
    }).sort({ dateTransaction: -1 });

    if (!cardHistory) return res.status(404).json({ error: "Card not found" });

    const formattedHistory = cardHistory.map((card) => {
      const dateTransaction =
        card.dateTransaction instanceof Date
          ? card.dateTransaction.toISOString()
          : null;

      return {
        ...card.toObject(),
        dateTransaction, // Ensure we are only formatting a valid Date
      };
    });

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const buyload = async (req, res) => {
  try {
    const { payment, userId } = req.body;
    console.log("buyload", payment, "hotdog", userId);
    const cards = await CardModel.find({ cardNumber: req.params.cardNumber });

    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: "Card not found" });
    }

    const card = cards[0];
    card.balance = Number(card.balance) + Number(payment);

    const cardHistory = new CardHistory({
      userId: userId,
      payment: payment,
      dateTransaction: new Date(),
      status: "Confirmed",
      type: "Load",
    });

    await cardHistory.save();
    await card.save(); // save updated balance

    return res.status(200).json({
      card,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const tapHistory = async (req, res) => {
  try {
    const history = await Taphistory.find().sort({ createdAt: -1 });

    if (!history || history.length === 0) {
      return res.status(404).json({ error: "No tap history found" });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error("❌ tapHistory error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const saveTapHistory = async (req, res) => {
  try {
    const {
      name,
      cardNo,
      vehicleType,
      hasActiveBooking,
      from,
      to,
      paymentStatus,
      amount,
      timestamp,
    } = req.body;

    const newTap = new Taphistory({
      name,
      cardNo,
      vehicleType,
      hasActiveBooking,
      from,
      to,
      paymentStatus,
      amount,
      clientTimestamp: timestamp ? new Date(timestamp) : null,
    });

    await newTap.save();

    res.status(201).json({ success: true, message: "Tap saved", tap: newTap });
  } catch (error) {
    console.error("❌ saveTapHistory error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



async function generateUniqueOtp() {
  let otp;
  let exists = true;

  // Loop until a unique OTP is generated
  while (exists) {
    otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const checkOTP = await Otp.findOne({ otp });
    exists = !!checkOTP; // continue loop if OTP exists
  }

  return otp;
}

export {
  register,
  Login,
  Logout,
  CheckUser,
  getCard,
  payment,
  forgotpassword,
  verifyOtp,
  savePassword,
  getCardHistory,
  buyload,
  tapHistory,
  saveTapHistory,
  setPassword,
};
