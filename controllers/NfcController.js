// controllers/NfcController.js
import { NFC } from "nfc-pcsc";
import { updateCardData, removeCardData } from "../utlis/nfcstore.js"; // ✅ Now importing from the correct shared module

const nfc = new NFC();

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
    //updateCardData(null);
  });
});

nfc.on("error", (err) => {
  console.error("NFC error:", err);
});
