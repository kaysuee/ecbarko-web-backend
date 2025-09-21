import PassengerFare from '../../models/superAdminModels/fareCategory.model.js';

// Get all passenger fares
const getPassengerFares = async (req, res) => {
  try {
    const fares = await PassengerFare.find();
    res.json(fares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new passenger fare
const addPassengerFare = async (req, res) => {
  try {
    const fare = new PassengerFare(req.body);
    await fare.save();
    res.status(201).json(fare);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit an existing passenger fare
const editPassengerFare = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PassengerFare.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Passenger fare not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default {
  getPassengerFares,
  addPassengerFare,
  editPassengerFare,
};
