import express from 'express';
import TicketClerk from '../../models/adminModels/ticketclerk.model.js';
import Token from '../../models/token.model.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import sendEmail from '../../utlis/sendEmail.js';
import { isUser } from '../../middleware/verifyToken.js';
import upload from "../../middleware/upload.js";

const router = express.Router();

// Get all clerks
router.get('/', async (req, res) => {
  try {
    const clerks = await TicketClerk.find();
    res.json(clerks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching clerks', error: err });
  }
});

// Create new clerk (inactive, sends invitation email)
router.post('/', async (req, res) => {
  const { name, email, clerkId } = req.body;

  try {
    // Check if email already exists in TicketClerk collection
    const existsInClerks = await TicketClerk.findOne({ email });
    
    if (existsInClerks) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create new clerk
    const newClerk = new TicketClerk({
      name,
      email,
      clerkId,
      password: null,
      status: 'inactive',
      role: 'ticket clerk'  // Add role field
    });
    await newClerk.save();

    // Generate one-time token
    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: newClerk._id,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 // 1 hour
    });

    // Send invitation email with link
    const link = `${process.env.FRONTEND_URL}/set-password/clerk/${token}`;
    await sendEmail(
      email,
      'Set up your Ticket Clerk account',
      `Hi ${name}, please click this link to set your password: ${link}`,
      `<p>Hi ${name},</p>
       <p>Please click the link below to set your password:</p>
       <a href="${link}">Set Password</a>`
    );

    res.status(201).json({ message: 'Clerk registered, invitation email sent' });
  } catch (err) {
    console.error("Create clerk error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Clerk sets password (from email link)
router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await TicketClerk.findByIdAndUpdate(tokenDoc.userId, {
      password: hashed,
      status: 'active',
      role: 'ticket clerk'  // Ensure role is set when activating
    });

    await Token.deleteOne({ _id: tokenDoc._id });

    res.json({ message: 'Password set successfully! You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update clerk info
router.put('/:id', async (req, res) => {
  try {
    // Check if email already exists (excluding current clerk)
    if (req.body.email) {
      const existsInClerks = await TicketClerk.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existsInClerks) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const updated = await TicketClerk.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Profile update endpoint for ticket clerks
router.post(
  "/update-profile",
  isUser,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.user._id; 

      const updateData = { name };
      if (req.file) {
        updateData.profileImage = `${process.env.BACKEND_URL || 'https://ecbarko-back.onrender.com'}/uploads/${req.file.filename}`;
      }
      
      const updatedUser = await TicketClerk.findByIdAndUpdate(userId, updateData, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Ticket Clerk profile updated successfully:", updatedUser);
      res.status(200).json({ user: updatedUser });
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ message: "Error updating profile", error: err.message });
    }
  }
);

// Update clerk password (for admin password reset)
router.put('/:clerkId/password', async (req, res) => {
  try {
    const { password } = req.body;
    const { clerkId } = req.params;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find by clerkId field, not by _id
    const updated = await TicketClerk.findOneAndUpdate(
      { clerkId: clerkId },
      { password: hashedPassword },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Ticket clerk not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;