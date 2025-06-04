import express from 'express';
import { CheckUser, Login, Logout, register, getCard, payment, forgotpassword,verifyOtp,savePassword, getCardHistory,buyload, tapHistory } from '../controllers/Auth.js';
import { isUser as IsUser, isAdminOrSuperAdmin } from '../middleware/verifyToken.js';
 
const AuthRoutes = express.Router();
 
AuthRoutes.post('/register', register);
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgotpassword', forgotpassword);
AuthRoutes.post('/verifyOTP', verifyOtp);
AuthRoutes.post('/resetPassword', savePassword);
AuthRoutes.post('/logout', Logout);
AuthRoutes.post('/card', payment);
AuthRoutes.post('/buyload/:cardNumber', buyload);
AuthRoutes.get('/CheckUser', IsUser, CheckUser);
AuthRoutes.get('/card/:cardNumber', getCard);
AuthRoutes.get('/cardHistory/:cardNumber', getCardHistory);
AuthRoutes.get('/tapHistory', tapHistory);
 
AuthRoutes.get('/api/users', IsUser, isAdminOrSuperAdmin, async (req, res) => {
 
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 
export default AuthRoutes;
 
 