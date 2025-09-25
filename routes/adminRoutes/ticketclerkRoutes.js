import express from 'express';
import TicketClerk from '../../models/adminModels/ticketclerk.model.js';
import Token from '../../models/token.model.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import sendEmail from '../../utlis/sendEmail.js';

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
    // Create new clerk
    const newClerk = new TicketClerk({
      name,
      email,
      clerkId,
      password: null,
      status: 'inactive'
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
      status: 'active'
    });

    await Token.deleteOne({ _id: tokenDoc._id });

    res.json({ message: 'Password set successfully! You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    // 🔑 Check if email already exists
    const email = req.body.email;
    const existsInClerks = await TicketClerk.findOne({ email });

    if (existsInClerks || existsInUsers || existsInAdmins) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const clerk = new TicketClerk(req.body);
    await clerk.save();
    res.status(201).json(clerk);
  } catch (err) {
    console.error("Create clerk error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update clerk info
router.put('/:id', async (req, res) => {
  try {
    const updated = await TicketClerk.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
