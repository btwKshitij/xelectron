require('@next/env').loadEnvConfig(process.cwd());
(async () => {
  const origin = process.env.SMS_SYNC_URL || process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.SMS_SYNC_SECRET;
  if (!origin || !secret) throw new Error('SMS_SYNC_URL and SMS_SYNC_SECRET are required');
  let cursor = null;
  do {
    const url = new URL('/api/internal/sms-sync', origin);
    if (cursor) url.searchParams.set('cursor', cursor);
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(300000), redirect: 'error' });
    if (!response.ok) throw new Error(`Sync returned HTTP ${response.status}`);
    const result = await response.json();
    console.log('Courier SMS sync:', { checked: result.checked, failed: result.failed });
    cursor = result.nextCursor;
  } while (cursor);
})().catch(error => { console.error('Courier SMS sync failed:', error.message); process.exitCode = 1; });
