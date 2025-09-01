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

router.post('/', isUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'super admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to create schedules' });
    }
    console.log('Creating schedule with data:', req.body);
    const newSchedule = new Schedule(req.body);
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Schedule creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', isUser, async (req, res) => {
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
    
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
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