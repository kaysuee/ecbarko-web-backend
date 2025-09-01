import express from 'express';
import Announcement from '../models/announcement.model.js';

const router = express.Router();

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ dateCreated: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new announcement
router.post('/', async (req, res) => {
  const { title, message, type, scheduleAffected, status, sentTo, author } = req.body;

  const newAnnouncement = new Announcement({
    title,
    message,
    type,
    scheduleAffected,
    status,
    sentTo,
    author,
  });

  try {
    const savedAnnouncement = await newAnnouncement.save();
    res.status(201).json(savedAnnouncement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an announcement
router.put('/:id', async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an announcement
router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
