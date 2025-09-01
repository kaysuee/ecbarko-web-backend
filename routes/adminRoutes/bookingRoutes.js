import express from 'express';
import ActiveBookingModel from '../../models/activebooking.js';


const router = express.Router();
console.log('bookingRoutes loaded');

router.get('/', async (req, res) => {
  try {
    const bookings = await ActiveBookingModel.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newBooking = new ActiveBookingModel(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create booking.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedBooking = await ActiveBookingModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update booking.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBooking = await ActiveBookingModel.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete booking.' });
  }
});

export default router;



