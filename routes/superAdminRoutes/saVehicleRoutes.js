import express from 'express';
import VehicleCategory from '../../models/vehicleCategory.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const vehicles = await VehicleCategory.find({ isActive: true });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle categories', details: err.message });
  }
});

export default router;
