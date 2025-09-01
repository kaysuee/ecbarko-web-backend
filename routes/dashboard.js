import express from 'express';
import ActiveBookingModel from '../models/activebooking.js';

const router = express.Router();

// Revenue grouped per month
router.get('/revenue', async (req, res) => {
  try {
    const result = await ActiveBookingModel.aggregate([
      { $match: { status: 'active' } },  // only active bookings
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$payment" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format response for frontend chart
    const formatted = result.map(r => ({
      name: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`, // e.g. 2025-01
      revenue: r.totalRevenue
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch monthly revenue' });
  }
});

// Debugging route (optional)
router.get('/revenue-debug', async (req, res) => {
  try {
    const bookings = await ActiveBookingModel.find({ status: 'active' });

    res.json({
      count: bookings.length,
      sample: bookings.slice(0, 5),
      payments: bookings.map(b => b.payment),
      total: bookings.reduce((sum, b) => sum + (b.payment || 0), 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Debug failed' });
  }
});

export default router;
