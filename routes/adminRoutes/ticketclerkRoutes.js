import express from 'express';
import TicketClerk from '../../models/adminModels/ticketclerk.model.js';
import Token from '../../models/token.model.js';
import sendEmail from '../../utlis/sendEmail.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clerks = await TicketClerk.find();
    res.json(clerks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Create new clerk (no password, inactive)
    const newClerk = new TicketClerk({
      name,
      email,
      clerkId,
      password: null,    // 👈 match User flow
      status: 'inactive'
    });
    await newClerk.save();

    // Create token for password setup
    const tokenValue = crypto.randomBytes(32).toString("hex");
    const token = new Token({
      userId: newClerk._id,
      token: tokenValue,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });
    await token.save();

    // Build link
    const link = `${process.env.CLIENT_URL}/set-password/${tokenValue}`;

    // Send email
    await sendEmail(
      newClerk.email,
      "Activate your EcBarko account",
      `Hello ${newClerk.name}, please activate your account by setting a password: ${link}`,
      `<p>Hello ${newClerk.name},</p>
       <p>Your EcBarko account has been created. Click below to set your password and activate your account:</p>
       <a href="${link}">Activate Account</a>
       <p>This link will expire in 1 hour.</p>`
    );

    res.status(201).json(newClerk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedClerk = await TicketClerk.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.json(updatedClerk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
    const { status, reason } = req.body;
    try {
      const updatedClerk = await TicketClerk.findByIdAndUpdate(
        req.params.id,
        { status, reason },
        { new: true }
      );
      res.json(updatedClerk);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});  

router.put('/:id/password', async (req, res) => {
  const { password } = req.body;

  try {
    const updatedUser = await TicketClerk.findOneAndUpdate(
      { clerkId: req.params.id },
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


export default router;
