import express from 'express';
import TicketClerk from '../../models/adminModels/ticketclerk.model.js';
import { sendResetPassword } from '../../utlis/email.js';
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
    const newClerk = new TicketClerk(req.body);
    await newClerk.save();
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
