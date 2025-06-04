cat > controllers/NfcController.js << 'ENDFILE'
// controllers/NfcController.js
import { updateCardData, removeCardData } from "../utlis/nfcstore.js";

let NFC;
let nfc = null;

// Try to import NFC, but handle gracefully if not available
try {
 const nfcModule = await import("nfc-pcsc");
 NFC = nfcModule.NFC;
 nfc = new NFC();
 console.log("✅ NFC module loaded successfully");
} catch (err) {
 console.log("⚠️ NFC not available in this environment (likely production)");
 NFC = null;
}

async function authenticate(
 reader,
 blockNumber,
 key = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
) {
 try {
   await reader.authenticate(blockNumber, 0x60, key);
   console.log(
     `✅ Authenticated block ${blockNumber} with key ${key.toString("hex")}`
   );
 } catch (err) {
   console.error(`❌ Authentication failed on block ${blockNumber}`, err);
   throw err;
 }
}

async function readBlock(reader, blockNumber) {
 await authenticate(reader, blockNumber);
 const data = await reader.read(blockNumber, 16, 16);
 console.log(`📄 Read block ${blockNumber}:`, data);
 return data;
}

// Initialize NFC only if available
if (nfc) {
 nfc.on("reader", (reader) => {
   console.log(`Reader ${reader.reader.name} attached`);

   reader.on("card", async (card) => {
     console.log(`Card detected`, card);
     const blockToAccess = 4;

     try {
       const currentData = await readBlock(reader, blockToAccess);
       let cardInfo = currentData.toString("utf8");
       cardInfo = cardInfo.replace(/\x00/g, "").trim(); // Clean up the data
       console.log("Card Info:", cardInfo);

       updateCardData({ cardNo: cardInfo, scannedAt: new Date() });

       setTimeout(() => removeCardData(), 5000);
      
     } catch (err) {
       console.error("Error during read:", err);
     }
   });

   reader.on("error", (err) => {
     console.error(`Reader error:`, err);
   });

   reader.on("end", () => {
     console.log(`Reader ${reader.reader.name} removed`);
   });
 });

 nfc.on("error", (err) => {
   console.error("NFC error:", err);
 });
}

// Export functions for API endpoints
export const getNfcStatus = (req, res) => {
 res.json({ 
   nfcAvailable: !!nfc,
   message: nfc ? "NFC is available" : "NFC not available in this environment"
 });
};

export const simulateCardScan = (req, res) => {
 if (!nfc) {
   // For testing in production, allow manual card simulation
   const { cardNo } = req.body;
   if (cardNo) {
     updateCardData({ cardNo, scannedAt: new Date(), simulated: true });
     setTimeout(() => removeCardData(), 5000);
     return res.json({ success: true, message: "Card scan simulated", cardNo });
   }
   return res.status(400).json({ error: "cardNo required for simulation" });
 }
 
 res.status(400).json({ error: "Use physical NFC reader when available" });
};
ENDFILE