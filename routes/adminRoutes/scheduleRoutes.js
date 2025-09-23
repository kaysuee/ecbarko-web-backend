import express from 'express';
import Schedule from '../../models/adminModels/schedule.model.js';
import UserModel from '../../models/superAdminModels/saAdmin.model.js';
import { isUser } from '../../middleware/verifyToken.js'; 

const router = express.Router();

router.get('/', isUser, async (req, res) => {
  try {
    const user = req.user;
    const { adminId } = req.query;
    
    console.log('User from token:', user);
    console.log('AdminId from query:', adminId);

    let schedules;

    if (user.role === 'super admin') {
      console.log('Fetching all schedules for super admin');
      schedules = await Schedule.find();
    } else if (user.role === 'admin') {
      console.log('Fetching schedules for admin with shippingLines:', user.shippingLines);
      
      let userShippingLines = user.shippingLines;
      
      if (!userShippingLines && adminId) {
        const dbUser = await UserModel.findOne({ adminId: adminId });
        if (dbUser) {
          userShippingLines = dbUser.shippingLines;
          console.log('Retrieved shippingLines from DB:', userShippingLines);
        }
      }
      
      if (userShippingLines) {
        schedules = await Schedule.find({ 
          shippingLines: userShippingLines 
        });
      } else {
        console.log('No shippingLines found for admin user');
        schedules = [];
      }
    } else {
      console.log('User role not authorized for schedule access:', user.role);
      schedules = [];
    }

    console.log('Schedules found:', schedules.length);
    res.json(schedules);
  } catch (err) {
    console.error('Schedule fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Replace your POST route with this improved version:

router.post('/', isUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'super admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to create schedules' });
    }

    console.log('Creating schedule with data:', req.body);
    console.log('User creating schedule:', { 
      id: user._id, 
      role: user.role, 
      shippingLines: user.shippingLines 
    });

    const {
      schedcde,
      date,
      departureTime,
      arrivalTime,
      arrivalDate,
      from,
      to,
      shippingLines,
      passengerCapacity,
      passengerBooked,
      vehicleCapacity,
      vehicleBooked
    } = req.body;

    // Validation
    if (!schedcde || !date || !departureTime || !arrivalTime || !from || !to || !shippingLines) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['schedcde', 'date', 'departureTime', 'arrivalTime', 'from', 'to', 'shippingLines'],
        received: req.body
      });
    }

    // Validate number fields
    const numericFields = {
      passengerCapacity: passengerCapacity || 200,
      passengerBooked: passengerBooked || 0,
      vehicleCapacity: vehicleCapacity || 50,
      vehicleBooked: vehicleBooked || 0
    };

    // Ensure all numeric fields are valid numbers
    for (const [field, value] of Object.entries(numericFields)) {
      if (isNaN(value) || value < 0) {
        return res.status(400).json({ 
          error: `Invalid ${field}: must be a non-negative number`,
          value: value
        });
      }
    }

    // Check if booked doesn't exceed capacity
    if (numericFields.passengerBooked > numericFields.passengerCapacity) {
      return res.status(400).json({ 
        error: 'Passengers booked cannot exceed passenger capacity' 
      });
    }

    if (numericFields.vehicleBooked > numericFields.vehicleCapacity) {
      return res.status(400).json({ 
        error: 'Vehicles booked cannot exceed vehicle capacity' 
      });
    }

    const newSchedule = new Schedule({
      schedcde,
      date,
      departureTime,
      arrivalTime,
      arrivalDate: arrivalDate || undefined, // Only set if provided
      from,
      to,
      shippingLines,
      passengerCapacity: numericFields.passengerCapacity,
      passengerBooked: numericFields.passengerBooked,
      vehicleCapacity: numericFields.vehicleCapacity,
      vehicleBooked: numericFields.vehicleBooked
    });

    console.log('About to save schedule:', newSchedule);
    await newSchedule.save();
    
    console.log('Schedule saved successfully:', newSchedule._id);
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Schedule creation error:', err);
    
    // Better error handling
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors,
        receivedData: req.body
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Duplicate schedule code',
        schedcde: req.body.schedcde
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message
    });
  }
});

///

router.put('/:id', isUser, async (req, res) => {
  console.log('DEBUG PUT /api/schedules/:id BODY:', JSON.stringify(req.body));
  try {
    const user = req.user;
    
    if (user.role !== 'super admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update schedules' });
    }
    
    if (user.role === 'admin') {
      const existingSchedule = await Schedule.findById(req.params.id);
      if (existingSchedule && existingSchedule.shippingLines !== user.shippingLines) {
        return res.status(403).json({ 
          error: 'You can only update schedules for your assigned shipping line' 
        });
      }
    }
    
    const {
      schedcde,
      date,
      departureTime,
      arrivalTime,
      arrivalDate,
      from,
      to,
      shippingLines,
      passengerCapacity,
      passengerBooked,
      vehicleCapacity,
      vehicleBooked
    } = req.body;
    const updateFields = {
  schedcde,
  date,
  departureTime,
  arrivalTime,
  from,
  to,
  shippingLines,
  passengerCapacity,
  passengerBooked,
  vehicleCapacity,
  vehicleBooked
};

if (arrivalDate !== undefined) {
  updateFields.arrivalDate = arrivalDate;
}

      console.log('DEBUG updateFields for PUT:', updateFields);
      const updatedSchedule = await Schedule.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true }
      );
    
    res.json(updatedSchedule);
  } catch (err) {
    console.error('Schedule update error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'super admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete schedules' });
    }
    
    if (user.role === 'admin') {
      const existingSchedule = await Schedule.findById(req.params.id);
      if (existingSchedule && existingSchedule.shippingLines !== user.shippingLines) {
        return res.status(403).json({ 
          error: 'You can only delete schedules for your assigned shipping line' 
        });
      }
    }
    
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    
    if (!deletedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('Schedule deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;