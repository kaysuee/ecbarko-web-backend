import express from 'express';
import AuditTrails from '../../models/audittrail.js';
import { isUser } from '../../middleware/verifyToken.js'; 

const router = express.Router();

router.get('/', isUser, async (req, res) => {
  try {
    const user = req.user;
    const { adminId } = req.query;
    
    console.log('User from token:', user);
    console.log('AdminId from query:', adminId);

    let audit;

    if (user.role === 'super admin') {
      console.log('Fetching all Audit for super admin');
      audit = await AuditTrails.find();
    }

    console.log('Audit found:', audit.length);
    res.json(audit);
  } catch (err) {
    console.error('Audit fetch error:', err);
    res.status(500).json({ error: err.message });
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