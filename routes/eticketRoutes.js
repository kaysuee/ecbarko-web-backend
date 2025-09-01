import express from 'express';
import Eticket from '../models/eticket.js';
import { isUser } from '../middleware/verifyToken.js'; 

const router = express.Router();
console.log('eticket loaded');
router.get('/', isUser, async (req, res) => {
  try {

    let eticket;

      console.log('Fetching all Eticket for super admin');
      eticket = await Eticket.find();
  
    console.log('eticket found:', eticket.length);
    res.json(eticket);
  } catch (err) {
    console.error('eticket fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
    console.log('PUT /api/eticket/:id hit', req.params.id, req.body);  // 🔍
    try {
      const updatedEticket = await Eticket.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedEticket) {
        return res.status(404).json({ error: 'Eticket not found.' });
      }
      res.json(updatedEticket);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update booking.' });
    }
  });

router.post('/', isUser, async (req, res) => {
  try {
    const user = req.user;

    console.log('Creating audit with data:', req.body);
    const newAudit = new AuditTrails(req.body);
    await newAudit.save();
    res.status(201).json(newAudit);
  } catch (err) {
    console.error('Schedule creation error:', err);
    res.status(400).json({ error: err.message });
  }
});



export default router;