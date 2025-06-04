// backend/routes/vehicle.route.js
import express from 'express';
import Vehicle from '../../models/adminModels/vehicle.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Get the vehicle with the highest userId
    const latestVehicle = await Vehicle.findOne().sort({ userId: -1 });

    // Increment userId
    const nextUserId = latestVehicle && latestVehicle.userId ? parseInt(latestVehicle.userId) + 1 : 1001;

    const newVehicle = new Vehicle({
      ...req.body,
      userId: nextUserId.toString(),
    });

    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
