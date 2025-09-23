import express from "express";
import TicketClerk from "../../models/adminModels/ticketclerk.model.js";
import crypto from "crypto";
import sendEmail, { generateSetupEmail } from "../../utlis/sendEmail.js"; 

const router = express.Router();

// Get all clerks
router.get("/", async (req, res) => {
  try {
    const clerks = await TicketClerk.find();
    res.json(clerks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new clerk (with setup password email)
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    // check if email already exists
    const existingClerk = await TicketClerk.findOne({ email });
    if (existingClerk) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // create clerk without password
    const newClerk = new TicketClerk({
      name,
      email,
      status: "pending",
    });
    await newClerk.save();

    // generate token for setup link
    const token = crypto.randomBytes(32).toString("hex");
    newClerk.resetToken = token;
    newClerk.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await newClerk.save();

    // build setup link
    const setupLink = `${process.env.CLIENT_URL}/set-password/${token}`;
    const html = generateSetupEmail(setupLink, newClerk.name);

    // send setup email
    await sendEmail(
      newClerk.email,
      "Welcome to ECBARKO - Set Up Your Ticket Clerk Account",
      "Click the link to set your password",
      html
    );

    res.status(201).json({
      message: "Ticket Clerk created and setup email sent",
      clerk: newClerk,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update clerk
router.put("/:id", async (req, res) => {
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

// Update status
router.put("/:id/status", async (req, res) => {
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

// (optional) Reset password (manual by super admin)
router.put("/:id/password", async (req, res) => {
  const { password } = req.body;
  try {
    const updatedClerk = await TicketClerk.findOneAndUpdate(
      { clerkId: req.params.id },
      { password },
      { new: true }
    );
    res.json(updatedClerk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
