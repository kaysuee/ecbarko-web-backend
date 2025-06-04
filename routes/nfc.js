// routes/nfc.js
import express from 'express';
import { getLatestCardData } from '../utlis/nfcstore.js'; // ✅ Correct source
const router = express.Router();

router.get('/scan-nfc', (req, res) => {
  const data = getLatestCardData();
  //console.log("NFC Data:", data); // Log the NFC data for debugging
  if (data) {
    res.json(data);
  } else {
    res.json({ status: 404 });
  }
});

export default router;
