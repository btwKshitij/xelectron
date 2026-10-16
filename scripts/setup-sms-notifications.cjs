require('@next/env').loadEnvConfig(process.cwd());
const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS sms_notifications (
      event_key TEXT PRIMARY KEY, event TEXT NOT NULL, phone TEXT NOT NULL,
      variables JSONB NOT NULL, status TEXT NOT NULL, batch_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    console.log('SMS notification storage ready. No SMS sent.');
  } finally { await client.end(); }
})().catch(() => { console.error('SMS storage setup failed; check database connectivity and permissions.'); process.exitCode = 1; });
