import express from "express";
import SAAdmin from "../../models/superAdminModels/saAdmin.model.js";
import Token from "../../models/token.model.js";
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import sendEmail from '../../utlis/sendEmail.js';
import { isUser } from '../../middleware/verifyToken.js';
import upload from "../../middleware/upload.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const admins = await SAAdmin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new admin (inactive, sends invitation email)
// Create new admin (inactive, sends invitation email)
router.post("/", async (req, res) => {
  try {
    const { name, email, shippingLines } = req.body; // ✅ include shippingLines

    if (!name || !email || !shippingLines) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingAdmin = await SAAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Generate adminId
    const lastAdmin = await SAAdmin.findOne().sort({ adminId: -1 });
    let newAdminId = 'A101'; 
    if (lastAdmin && lastAdmin.adminId) {
      const lastIdNum = parseInt(lastAdmin.adminId.slice(1));
      const nextIdNum = lastIdNum + 1;
      newAdminId = `A${nextIdNum}`;
    }

    // Create new admin
    const newAdmin = new SAAdmin({
      name,
      email,
      password: null,
      role: "admin",
      status: "inactive",
      adminId: newAdminId,
      shippingLines // ✅ include shippingLines here
    });

    await newAdmin.save();

    // Generate one-time token
    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: newAdmin._id,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    });

    const link = `${process.env.FRONTEND_URL}/set-password/admin/${token}`;
    await sendEmail(
      email,
      'Set up your Admin account',
      `Hi ${name}, please click this link to set your password and activate your admin account: ${link}`,
      `<p>Hi ${name},</p>
       <p>You have been invited to join as an Admin. Please click the link below to set your password and activate your account:</p>
       <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Password</a>
       <p>This link will expire in 24 hours.</p>`
    );

    res.status(201).json({ message: 'Admin registered, invitation email sent' });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(400).json({ error: err.message });
  }
});


// Admin sets password (from email link)
router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    await SAAdmin.findByIdAndUpdate(tokenDoc.userId, {
      password: hashedPassword,
      status: 'active', // Activate the account
      role: 'admin'
    });

    await Token.deleteOne({ _id: tokenDoc._id });

    res.json({ message: 'Password set successfully! You can now log in.' });
  } catch (err) {
    console.error('Set password error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updateFields = req.body;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No data to update." });
    }

    // Check if email already exists (excluding current admin)
    if (updateFields.email) {
      const existingAdmin = await SAAdmin.findOne({ 
        email: updateFields.email, 
        _id: { $ne: req.params.id } 
      });
      if (existingAdmin) {
        return res.status(400).json({ error: "Email already exists." });
      }
    }

    const updatedAdmin = await SAAdmin.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update admin password (for super admin password reset)
router.put('/:adminId/password', async (req, res) => {
  try {
    const { password } = req.body;
    const { adminId } = req.params;

    // Hash the new password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Find by adminId field, not by _id
    const updated = await SAAdmin.findOneAndUpdate(
      { adminId: adminId },
      { password: hashedPassword },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Profile update endpoint for super admins
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
      
      const updatedUser = await SAAdmin.findByIdAndUpdate(userId, updateData, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Super Admin profile updated successfully:", updatedUser);
      res.status(200).json({ user: updatedUser });
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ message: "Error updating profile", error: err.message });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const deletedAdmin = await SAAdmin.findByIdAndDelete(req.params.id);
    
    if (!deletedAdmin) {
      return res.status(404).json({ error: "Admin not found." });
    }
    
    res.json({ message: "Admin deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;