// Simple pg_notify listener that forwards new_report notifications to HEALER_URL
// Usage: node pg_notify_listener.js

const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const HEALER_URL = process.env.HEALER_URL;
const HEALER_SECRET = process.env.HEALER_SECRET;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}
if (!HEALER_URL) {
  console.error('HEALER_URL not set');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  client.on('notification', async (msg) => {
    if (msg.channel === 'new_report') {
      try {
        console.log('Forwarding new_report to healer');
        await fetch(HEALER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-healer-secret': HEALER_SECRET || '' },
          body: msg.payload,
        });
      } catch (e) { console.error('forward failed', e); }
    }
  });
  await client.query('LISTEN new_report');
  console.log('Listening for new_report notifications...');
}

main().catch((e) => { console.error(e); process.exit(1); });
