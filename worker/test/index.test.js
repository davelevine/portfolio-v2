// Run with `npm test`. Stubs fetch so nothing reaches Turnstile or Lettermint.
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import worker from '../src/index.js';

const env = { TURNSTILE_SECRET: 'ts-secret', LETTERMINT_TOKEN: 'lm-token', CONTACT_TO: 'inbox@example.com', CONTACT_FROM: 'site <sender@example.com>' };
const realFetch = globalThis.fetch;
afterEach(() => (globalThis.fetch = realFetch));

/** Stub fetch: answers siteverify with `turnstile` and Lettermint with `lettermint`, recording calls. */
function stub({ turnstile = { success: true, hostname: 'dave.levine.io' }, lettermint = 202 } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('turnstile')) return Response.json(turnstile);
    return new Response('{}', { status: lettermint });
  };
  return calls;
}

/** Encode a multipart body with the Content-Length a browser would send. */
async function encode(fields) {
  const form = new FormData();
  for (const [k, v] of Object.entries({ email: 'visitor@example.org', message: 'Hello there', 'cf-turnstile-response': 'tok', ...fields })) {
    form.set(k, v);
  }
  const encoded = new Response(form);
  const body = await encoded.arrayBuffer();
  return { body, headers: { 'Content-Type': encoded.headers.get('Content-Type'), 'Content-Length': String(body.byteLength) } };
}

async function post(fields, url = 'https://dave.levine.io/api/contact') {
  return worker.fetch(new Request(url, { method: 'POST', ...(await encode(fields)) }), env);
}

test('sends a valid message with the visitor as Reply-To', async () => {
  const calls = stub();
  const res = await post({});
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });

  const verify = calls[0].init.body;
  assert.equal(verify.get('secret'), 'ts-secret');
  assert.equal(verify.get('response'), 'tok');

  assert.equal(calls[1].init.headers['x-lettermint-token'], 'lm-token');
  const mail = JSON.parse(calls[1].init.body);
  assert.equal(mail.from, 'site <sender@example.com>');
  assert.deepEqual(mail.to, ['inbox@example.com']);
  assert.deepEqual(mail.reply_to, ['visitor@example.org']);
  assert.equal(mail.text, 'Hello there');
});

test('honeypot submissions get a fake success and send nothing', async () => {
  const calls = stub();
  const res = await post({ _gotcha: 'bot' });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test('rejects bad fields before calling Turnstile', async () => {
  const calls = stub();
  for (const fields of [{ email: 'nope' }, { email: 'a b@example.org' }, { email: 'a@b.co\r\nBcc: x@y.z' }, { message: '  ' }, { message: 'x'.repeat(5001) }]) {
    const res = await post(fields);
    assert.equal(res.status, 422, JSON.stringify(fields));
    assert.ok((await res.json()).error);
  }
  assert.equal(calls.length, 0);
});

test('rejects a failed or foreign-host Turnstile check without sending', async () => {
  for (const turnstile of [{ success: false }, { success: true, hostname: 'evil.example' }]) {
    const calls = stub({ turnstile });
    const res = await post({});
    assert.equal(res.status, 403);
    assert.equal(calls.length, 1);
  }
});

test('reports a Lettermint failure as 502', async () => {
  stub({ lettermint: 422 });
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal((await post({})).status, 502);
  } finally {
    console.error = original;
  }
});

test('only accepts POST', async () => {
  const res = await worker.fetch(new Request('https://dave.levine.io/api/contact'), env);
  assert.equal(res.status, 405);
});

test('rejects a body without Content-Length before reading it', async () => {
  const calls = stub();
  const { body, headers } = await encode({});
  const res = await worker.fetch(
    new Request('https://dave.levine.io/api/contact', { method: 'POST', body, headers: { 'Content-Type': headers['Content-Type'] } }),
    env
  );
  assert.equal(res.status, 413);
  assert.equal(calls.length, 0);
});
