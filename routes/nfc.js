// routes/nfc.js
import express from 'express';
import { getLatestCardData } from '../utlis/nfcstore.js'; // ✅ Correct source
const router = express.Router();

router.get('/scan-nfc', (req, res) => {
  const data = getLatestCardData();
  if (data) {
    res.json(data);
  } else {
    res.json({ cardNo: null }); // clear signal
  }
});


export default router;
