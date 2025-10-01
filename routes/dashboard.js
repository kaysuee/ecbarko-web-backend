import express from 'express';
import ActiveBookingModel from '../models/activebooking.js';

const router = express.Router();

// Revenue grouped per month
router.get('/revenue', async (req, res) => {
  try {
    const { shippingLine } = req.query; // Extract shippingLine from query params

    const matchStage = { status: 'active' };
    if (shippingLine) {
      matchStage.shippingLine = { $regex: new RegExp(`^${shippingLine}$`, 'i') }; // Case-insensitive match
    }

    console.log("Match stage:", matchStage); // Debug log

    // Debug: Log all active bookings to see actual shippingLine values
    const allActiveBookings = await ActiveBookingModel.find({ status: 'active' });
    console.log("All active bookings shippingLine values:", allActiveBookings.map(booking => ({
      id: booking._id,
      shippingLine: booking.shippingLine,
      payment: booking.payment,
      createdAt: booking.createdAt
    })));

    const result = await ActiveBookingModel.aggregate([
      { $match: matchStage },
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

    // Ensure current month is included even if no revenue
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    const currentMonthName = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    
    // Check if current month exists in results
    const currentMonthExists = formatted.some(item => item.name === currentMonthName);
    
    // If current month doesn't exist, add it with 0 revenue
    if (!currentMonthExists) {
      formatted.push({
        name: currentMonthName,
        revenue: 0
      });
    }

    // Sort by year and month to ensure proper order
    formatted.sort((a, b) => a.name.localeCompare(b.name));

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
