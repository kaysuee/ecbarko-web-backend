import express from 'express';
import ActiveBookingModel from '../../models/activebooking.js';
import UserModel from '../../models/superAdminModels/saAdmin.model.js';
import { isUser } from '../../middleware/verifyToken.js';

const router = express.Router();

router.get('/', isUser, async (req, res) => {
  try {
    const user = req.user;
    const { adminId } = req.query;

    let bookings;

    if (user.role === 'super admin' || user.role === 'ticket clerk') {
      bookings = await ActiveBookingModel.find().sort({ createdAt: -1 });
    } else if (user.role === 'admin') {
      let userShippingLines = user.shippingLines;

      if (!userShippingLines && adminId) {
        const dbUser = await UserModel.findOne({ adminId });
        if (dbUser) {
          userShippingLines = dbUser.shippingLines;
        }
      }

      if (userShippingLines) {
        bookings = await ActiveBookingModel.find({
          shippingLine: userShippingLines
        }).sort({ createdAt: -1 });
      } else {
        bookings = [];
      }
    } else {
      bookings = [];
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isUser, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'super admin' && user.role !== 'admin' && user.role !== 'ticket clerk') {
      return res.status(403).json({ error: 'Unauthorized to create bookings' });
    }

    console.log("Incoming booking body:", req.body);

    const newBooking = new ActiveBookingModel(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', isUser, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'super admin' && user.role !== 'admin' && user.role !== 'ticket clerk') {
      return res.status(403).json({ error: 'Unauthorized to update bookings' });
    }

    if (user.role === 'admin') {
      const existingBooking = await ActiveBookingModel.findById(req.params.id);
      if (existingBooking && existingBooking.shippingLine !== user.shippingLines) {
        return res.status(403).json({
          error: 'You can only update bookings for your assigned shipping line'
        });
      }
    }

    const updatedBooking = await ActiveBookingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isUser, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'super admin' && user.role !== 'admin' && user.role !== 'ticket clerk') {
      return res.status(403).json({ error: 'Unauthorized to delete bookings' });
    }

    if (user.role === 'admin') {
      const existingBooking = await ActiveBookingModel.findById(req.params.id);
      if (existingBooking && existingBooking.shippingLine !== user.shippingLines) {
        return res.status(403).json({
          error: 'You can only delete bookings for your assigned shipping line'
        });
      }
    }

    const deletedBooking = await ActiveBookingModel.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
