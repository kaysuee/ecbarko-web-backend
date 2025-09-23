import express from 'express';
import { getAllFareCategories, getAllVehicleCategories } from '../controllers/FareVehicleDataController.js';

const router = express.Router();

router.get('/fares', getAllFareCategories);
router.get('/vehicles', getAllVehicleCategories);

export default router;
