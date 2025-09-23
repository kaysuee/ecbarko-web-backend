import PassengerFare from '../models/superAdminModels/fareCategory.model.js';
import VehicleCategory from '../models/vehicleCategory.model.js';

export const getAllFareCategories = async (req, res) => {
  try {
    const fares = await PassengerFare.find({ isActive: true });
    res.json(fares);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fare categories', details: err.message });
  }
};

export const getAllVehicleCategories = async (req, res) => {
  try {
    const vehicles = await VehicleCategory.find({ isActive: true });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle categories', details: err.message });
  }
};
