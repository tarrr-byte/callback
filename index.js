require('dotenv').config();

const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const CALLBACK_API_KEY = process.env.CALLBACK_API_KEY;

app.post('/callback', (req, res) => {
  // Ambil IP untuk logging saja
  const forwardedFor = req.headers['x-forwarded-for'];

  const ip = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.socket.remoteAddress;

  // Ambil API Key dari header
  const apiKey = req.headers['x-api-key'];

  console.log('\n=== Payment Callback Diterima ===');
  console.log('IP Pengirim:', ip);
  console.log('Body:', req.body);

  // =========================
  // VALIDASI X-API-KEY
  // =========================

  if (!apiKey) {
    console.warn('X-API-Key not found');

    return res.status(401).json({
      status: 'unauthorized',
      message: 'Missing API key'
    });
  }

  if (apiKey !== CALLBACK_API_KEY) {
    console.warn('X-API-Key tidak valid');

    return res.status(401).json({
      status: 'unauthorized',
      message: 'Invalid API key'
    });
  }

  // =========================
  // CALLBACK VALID
  // =========================

  console.log('X-API-Key valid');
  console.log('Callback terverifikasi');

  const logEntry = {
    timestamp: new Date().toISOString(),
    ip,
    body: req.body
  };

  fs.appendFileSync(
    'payment_log.txt',
    JSON.stringify(logEntry) + '\n'
  );

  return res.status(200).json({
    status: 'received'
  });
});

app.get('/', (req, res) => {
  res.send('Payment Callback Server Aktif!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
