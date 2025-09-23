import express from 'express';
import User from '../../models/adminModels/userAccount.model.js';
import Users from '../../models/superAdminModels/saAdmin.model.js';
import { isAdminOrSuperAdmin } from '../../middleware/verifyToken.js';  
import { sendResetPassword } from '../../utlis/email.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Token from '../../models/token.model.js'; 
import sendEmail from '../../utlis/sendEmail.js';

const router = express.Router();

router.get('/', async (req, res) => { 
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user accounts', error: err });
  }
});

// Admin creates a user (no password, inactive, sends invite email)
router.post('/', async (req, res) => {
  const { name, email, phone, type } = req.body;

  try {
    // Generate new userId
    const lastUser = await User.aggregate([
      { $addFields: { numId: { $toInt: { $substr: ["$userId", 1, -1] } } } },
      { $sort: { numId: -1 } },
      { $limit: 1 }
    ]);
    let nextNum = 1;
    if (lastUser.length > 0) {
      nextNum = lastUser[0].numId + 1;
    }
    const finalUserId = `U${String(nextNum).padStart(4, '0')}`;

    // Save user without password
    const newUser = new User({
      userId: finalUserId,
      name,
      email,
      phone,
      type,
      password: null,
      status: 'inactive',
      lastActive: null
    });
    await newUser.save();

    // Generate one-time token
    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: newUser._id,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 // 1 hour
    });

    // Send invitation email with link to frontend
    const link = `${process.env.CLIENT_URL}/set-password/${token}`;
    await sendEmail(
      email,
      'Set up your account',
      `Hi ${name}, please click this link to set your password: ${link}`,
      `<p>Hi ${name},</p>
       <p>Please click the link below to set your password:</p>
       <a href="${link}">Set Password</a>`
    );

    res.status(201).json({ message: 'User registered, invitation email sent' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User sets their password (from email link)
router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(tokenDoc.userId, {
      password: hashed,
      status: 'active',
      lastActive: new Date().toISOString()
    });

    await Token.deleteOne({ _id: tokenDoc._id });

    res.json({ message: 'Password set successfully! You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
    const { status, reason } = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { status, reason },
        { new: true }
      );
      res.json(updatedUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});  

router.put('/:id/password', async (req, res) => {
  const { password } = req.body;

  try {
    const updatedUser = await Users.findOneAndUpdate(
      { adminId: req.params.id },
      { password },
      { new: true }
    );
    console.log("Updated User:", updatedUser);
    await sendResetPassword(updatedUser.email, password);
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});  

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const total = await User.countDocuments();
    const thisMonth = await User.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const lastMonth = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } });

    const percentageChange = lastMonth === 0 ? 100 : ((thisMonth - lastMonth) / lastMonth) * 100;

    res.json({
      total,
      newThisMonth: thisMonth,
      percentageChange: percentageChange.toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user stats', error: err });
  }
});

export default router;
