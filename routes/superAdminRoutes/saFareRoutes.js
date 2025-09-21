import express from 'express';
import FareCategoryController from '../../controllers/superAdminModels/FareCategoryController.js';

const router = express.Router();


// Get all passenger fares
router.get('/', FareCategoryController.getPassengerFares);

// Add a new passenger fare
router.post('/', FareCategoryController.addPassengerFare);

// Edit an existing passenger fare
router.put('/:id', FareCategoryController.editPassengerFare);

export default router;
