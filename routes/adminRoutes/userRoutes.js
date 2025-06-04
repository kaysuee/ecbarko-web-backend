import express from 'express';
import User from '../../models/adminModels/userAccount.model.js';
import Users from '../../models/superAdminModels/saAdmin.model.js';
import { isAdminOrSuperAdmin } from '../../middleware/verifyToken.js';  
import { sendResetPassword } from '../../utlis/email.js';
const router = express.Router();

router.get('/', async (req, res) => { 
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user accounts', error: err });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, type, status, lastActive } = req.body;
  try {
    // Find the user with the highest numeric ID
    const lastUser = await User.findOne().sort({ userId: -1 });
    let nextNum = 1;
    if (lastUser) {
      // Extract numeric part from something like "U1005"
      const match = lastUser.userId.match(/(\d+)$/);
      const lastNum = match ? parseInt(match[1], 10) : 0;
      nextNum = lastNum + 1;
    }
    const newUserId = `U${nextNum}`;  // rebuild with your prefix

    const newUser = new User({
      userId: newUserId,
      name,
      email,
      phone,
      type,
      status,
      lastActive
    });

    await newUser.save();
    res.status(201).json(newUser);
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
