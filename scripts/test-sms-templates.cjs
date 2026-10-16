const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { test } = require('node:test');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => mocks[name] || require(name), mod, mod.exports);
  return mod.exports;
}
const templates = load('lib/server/sms/templates.ts');
test('checkout sends the mobile template ID instead of the global template setting', async () => {
  const previousFetch = global.fetch;
  const previousKey = process.env.SMSALERT_API_KEY;
  const previousTemplate = process.env.SMSALERT_TEMPLATE_ID;
  try {
    process.env.SMSALERT_API_KEY = 'test-key';
    process.env.SMSALERT_TEMPLATE_ID = 'wrong-global-template';
    global.fetch = async input => {
      const url = new URL(input);
      assert.equal(url.searchParams.get('template'), '1077514700018247727');
      assert.equal(url.searchParams.get('text'), templates.renderSms('mobileOtp', ['654321']).message);
      assert.equal(url.searchParams.get('mobileno'), '919876543210');
      return Response.json({ status: 'success', description: { batchid: 'test', batch_dtl: [{ status: 'AWAITED-DLR' }] } });
    };
    const sms = load('lib/server/sms/smsalert.ts', { './templates': templates });
    assert.equal((await sms.sendOtpSms('9876543210', '654321')).success, true);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.SMSALERT_API_KEY; else process.env.SMSALERT_API_KEY = previousKey;
    if (previousTemplate === undefined) delete process.env.SMSALERT_TEMPLATE_ID; else process.env.SMSALERT_TEMPLATE_ID = previousTemplate;
  }
});
test('all 21 templates have unique IDs, exact mobile OTP text, and validated variables', () => {
  assert.equal(Object.keys(templates.smsTemplates).length, 21);
  assert.equal(new Set(Object.values(templates.smsTemplates).map(t => t.id)).size, 21);
  for (const [event, template] of Object.entries(templates.smsTemplates)) {
    const values = Array((template.text.match(/\{#var#\}/g) || []).length).fill('TEST');
    const rendered = templates.renderSms(event, values);
    assert.equal(rendered.templateId, template.id);
    assert(!rendered.message.includes('{#var#}'));
    assert.throws(() => templates.renderSms(event, []));
  }
  assert.deepEqual(templates.renderSms('mobileOtp', ['654321']), { templateId: '1077514700018247727', message: 'XElectron: Your mobile number verification code is 654321. Please use this code to verify your mobile number with XElectron.' });
  assert.throws(() => templates.renderSms('shipped', ['order']));
  assert.throws(() => templates.renderSms('service', ['bad\nvalue']));
});
test('concurrent duplicate events send once; failed or interrupted events are not blindly replayed', async () => {
  const records = new Map(); let sent = 0; let success = true;
  const db = {
    $queryRaw: async (_, key, event, phone, values) => {
      if (records.has(key)) return [];
      records.set(key, 'SENDING'); return [{ event_key: key }];
    },
    $executeRaw: async (_, status, batch, key) => { records.set(key, status); },
    order: { findUnique: async () => ({ id: 'order12345678', customerPhone: '9876543210', paymentVerified: false, trackingNumber: null }) },
  };
  const notification = load('lib/server/sms/notifications.ts', {
    '@/lib/db': { db }, '@/lib/order-reference': { formatOrderReference: id => id }, './templates': templates,
    './smsalert': { sendSmsViaSmsAlert: async () => { sent++; return { success, data: { description: { batchid: 'batch' } } }; } },
  });
  await Promise.all([1,2,3].map(() => notification.notifySms('same', 'cod', '9876543210', ['ORDER'])));
  assert.equal(sent, 1); assert.equal(records.get('same'), 'ACCEPTED');
  success = false;
  await notification.notifySms('failure', 'cod', '9876543210', ['ORDER']);
  await notification.notifySms('failure', 'cod', '9876543210', ['ORDER']);
  assert.equal(sent, 2); assert.equal(records.get('failure'), 'REVIEW');
  assert.equal(await notification.notifyOrderSms('order', 'paid'), false);
  assert.equal(await notification.notifyOrderSms('order', 'shipped'), false);
  assert.equal(sent, 2);
  db.$queryRaw = async () => { throw new Error('database down'); };
  assert.equal(await notification.notifySms('db-down', 'cod', '9876543210', ['ORDER']), false);
});
test('courier events require a known forward delivery status', () => {
  const courier = load('lib/server/sms/courier.ts', { './notifications': { notifyOrderSms: async () => true } });
  assert.equal(courier.courierSmsEvent({ found: true, status: 'Dispatched' }), 'outForDelivery');
  assert.equal(courier.courierSmsEvent({ found: true, status: 'Delivered' }), 'delivered');
  assert.equal(courier.courierSmsEvent({ found: true, status: 'Delivered', statusType: 'RT' }), null);
  assert.equal(courier.courierSmsEvent({ found: false, status: 'Delivered' }), null);
  assert.equal(courier.courierSmsEvent({ found: true, status: 'Unknown' }), null);
});

test('staff notification actions reject unauthenticated requests before database access', async () => {
  class AuthError extends Error { constructor() { super('Unauthorized'); this.status = 401; } }
  const auth = { AuthError, requireAdmin: async () => { throw new AuthError(); } };
  const db = new Proxy({}, { get: () => { throw new Error('Database must not be accessed'); } });
  const route = load('app/api/support-requests/[id]/sms/route.ts', {
    '@/lib/server/dal/auth': auth, '@/lib/db': { db },
    '@/lib/server/sms/notifications': {}, '@/lib/order-reference': {},
  });
  const response = await route.POST(new Request('http://localhost', { method: 'POST', body: '{}' }), { params: Promise.resolve({ id: 'request' }) });
  assert.equal(response.status, 401);
});
