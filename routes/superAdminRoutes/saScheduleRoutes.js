import express from 'express';
import Schedule from '../../models/adminModels/schedule.model.js';
import { isUser } from '../../middleware/verifyToken.js'; 

const router = express.Router();

router.get('/', isUser, async (req, res) => {
  try {
    const user = req.user;
    console.log('User role:', user.role, 'ShippingLines:', user.shippingLines);

    let schedules;

    if (user.role === 'super admin') {
      // Super admin: get all schedules, no filter
      schedules = await Schedule.find();
    } else {
      // Admin: get schedules only for assigned shippingLines
      schedules = await Schedule.find({ shippingLine: { $in: user.shippingLines } });
    }

    res.json(schedules);
  } catch (err) {
    console.error('Schedule fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Other routes...

export default router;
