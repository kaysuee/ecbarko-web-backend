import express from 'express';
import User from '../../models/adminModels/userAccount.model.js';
import Users from '../../models/superAdminModels/saAdmin.model.js';
import { isAdminOrSuperAdmin, isUser } from '../../middleware/verifyToken.js';  
import { sendResetPassword } from '../../utlis/email.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Token from '../../models/token.model.js'; 
import sendEmail from '../../utlis/sendEmail.js';
import upload from "../../middleware/upload.js";

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
    // Generate new userId - safer approach
    const lastUser = await User.aggregate([
      {
        $match: {
          userId: { $regex: /^U\d+$/ } // Only match valid format like U0001, U0002, etc.
        }
      },
      {
        $addFields: {
          numId: {
            $convert: {
              input: { $substr: ["$userId", 1, -1] },
              to: "int",
              onError: 0 // Return 0 if conversion fails
            }
          }
        }
      },
      { $sort: { numId: -1 } },
      { $limit: 1 }
    ]);

    let nextNum = 1;
    if (lastUser.length > 0) {
      nextNum = lastUser[0].numId + 1;
    }
    const finalUserId = `U${String(nextNum).padStart(4, '0')}`;

    // Rest of your code remains the same...
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
    const link = `${process.env.FRONTEND_URL}/set-password/user/${token}`;
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


router.post(
  "/update-profile",
  isUser,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.user._id;

      console.log("=== Update Profile Request ===");
      console.log("User ID:", userId);
      console.log("Name:", name);
      console.log("File uploaded:", req.file ? "Yes" : "No");
      if (req.file) {
        console.log("File details:", req.file);
      }

      const updateData = { name };
      
      if (req.file) {
        // Construct the full URL to the uploaded image
        const backendUrl = process.env.BACKEND_URL || 'https://ecbarko-back.onrender.com';
        updateData.profileImage = `${backendUrl}/uploads/${req.file.filename}`;
        console.log("Profile image URL:", updateData.profileImage);
      }

      // Try updating in Users collection first (for super admin/admin)
      let updatedUser = await Users.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password'); // Don't send password back

      // If not found, try User collection (for regular users)
      if (!updatedUser) {
        updatedUser = await User.findByIdAndUpdate(
          userId, 
          updateData, 
          { new: true, runValidators: true }
        ).select('-password');
      }

      if (!updatedUser) {
        console.log("User not found in either collection");
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Updated user:", updatedUser);
      console.log("=== Update Complete ===");

      res.status(200).json({ 
        message: "Profile updated successfully",
        user: updatedUser 
      });
    } catch (err) {
      console.error("=== Update Profile Error ===");
      console.error("Error:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      res.status(500).json({ 
        message: "Error updating profile", 
        error: err.message 
      });
    }
  }
);

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

// User change password endpoint
router.post('/change-password', isUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Get user from token (set by isUser middleware)
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password directly on the user object
    user.password = hashedNewPassword;
    const updatedUser = await user.save();
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    
    res.status(200).json({ 
      message: 'Password changed successfully',
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
});

export default router;
