import express from 'express';
import Card from '../../models/adminModels/card.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

router.post('/', async (req, res) => {
  try {
    const newCard = new Card(req.body);
    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const active = await Card.countDocuments({ status: "active" });
    const newThisMonth = await Card.countDocuments({ createdAt: { $gte: startOfThisMonth }, status: "active" });
    const lastMonth = await Card.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }, status: "active" });

    const percentageChange = lastMonth === 0 ? 100 : ((newThisMonth - lastMonth) / lastMonth) * 100;

    res.json({
      active,
      newThisMonth,
      percentageChange: percentageChange.toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching card stats', error: err });
  }
});

export default router;
