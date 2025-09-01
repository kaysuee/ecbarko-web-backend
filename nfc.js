import { NFC } from 'nfc-pcsc';

const nfc = new NFC();

async function authenticate(reader, blockNumber, key = Buffer.from([0xff,0xff,0xff,0xff,0xff,0xff])) {
  try {
    await reader.authenticate(blockNumber, 0x60, key);
    console.log(`✅ Authenticated block ${blockNumber} with key ${key.toString('hex')}`);
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

async function writeBlock(reader, blockNumber, data) {
  if (!Buffer.isBuffer(data)) {
    data = Buffer.from(data);
  }
  if (data.length !== 16) {
    // pad or slice to 16 bytes
    const buf = Buffer.alloc(16, 0);
    data.copy(buf);
    data = buf;
  }

  await authenticate(reader, blockNumber);
  await reader.write(blockNumber, data, 16);
  console.log(`✍️  Wrote data to block ${blockNumber}`);
}

nfc.on('reader', reader => {
  console.log(`Reader ${reader.reader.name} attached`);

  reader.on('card', async card => {
    console.log(`Card detected`, card);

    const blockToAccess = 4; // choose a valid data block (not sector trailer)

    try {
      // Read current data
      const currentData = await readBlock(reader, blockToAccess);
      console.log('Current block data:', currentData.toString('utf8'));

      // Prepare data to write (exactly 16 bytes)
      const newData = Buffer.from('5545-9052-9909'); // LAGAYAN NG CARD NO. (node nfc.js)

      // Write new data
      await writeBlock(reader, blockToAccess, newData);

      // Read again to verify
      const verifyData = await readBlock(reader, blockToAccess);
      console.log('Verified block data:', verifyData.toString('utf8'));
    } catch (err) {
      console.error('Error during read/write:', err);
    }
  });

  reader.on('error', err => {
    console.error(`Reader error:`, err);
  });

  reader.on('end', () => {
    console.log(`Reader ${reader.reader.name} removed`);
  });
});

nfc.on('error', err => {
  console.error('NFC error:', err);
});
