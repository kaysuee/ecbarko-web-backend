import express from 'express';
import { 
  CheckUser, Login, Logout, register, 
  getCard, payment, forgotpassword,
  verifyOtp, savePassword, getCardHistory,
  buyload, tapHistory, saveTapHistory 
} from '../controllers/Auth.js';
import { isUser, isAdminOrSuperAdmin } from '../middleware/verifyToken.js';
import { setPassword } from '../controllers/Auth.js';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.js';
import BlacklistedTokenModel from '../models/blacklistedToken.model.js';
 
const AuthRoutes = express.Router();
 
AuthRoutes.post('/register', register);
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgot-password', forgotpassword);
AuthRoutes.post('/verifyOTP', verifyOtp);
AuthRoutes.post('/reset-password', savePassword);
AuthRoutes.post('/logout', Logout);
AuthRoutes.post('/card', payment);
AuthRoutes.post('/buyload/:cardNumber', buyload);
AuthRoutes.post('/set-password', setPassword);

// Verify super admin credentials
AuthRoutes.post('/verify-super-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email and check if they are super admin
    const user = await UserModel.findOne({ email, role: 'super admin' });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.status(200).json({ success: true, message: 'Super admin verified' });
  } catch (error) {
    console.error('Super admin verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Clear blacklisted tokens for a user (for testing/debugging)
AuthRoutes.post('/clear-blacklist', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const result = await BlacklistedTokenModel.deleteMany({ userId });
    
    res.status(200).json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} blacklisted tokens for user ${userId}` 
    });
  } catch (error) {
    console.error('Clear blacklist error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

AuthRoutes.get('/CheckUser', isUser, CheckUser);
AuthRoutes.get('/card/:cardNumber', getCard);
AuthRoutes.get('/cardHistory/:cardNumber', getCardHistory);

// 👇 fixed tap history routes
AuthRoutes.get('/tapHistory', isUser, tapHistory);       // fetch all history
AuthRoutes.post('/tapHistory', isUser, saveTapHistory);  // save new history

AuthRoutes.get('/api/users', isUser, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 
export default AuthRoutes;
