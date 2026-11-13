// Contact-form backend for dave.levine.io/api/contact (route owned by homelab-iac).
// Verifies the Turnstile token, validates the fields, and emails the message through
// Lettermint with the visitor's address as Reply-To, so a reply goes straight to them.
//
// Secrets (wrangler secret put): TURNSTILE_SECRET, LETTERMINT_TOKEN, CONTACT_TO, CONTACT_FROM.

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const LETTERMINT = 'https://api.lettermint.co/v1/send';
const MAX_BODY = 64 * 1024;
const MAX_MESSAGE = 5000;
// No whitespace anywhere, so the address can't smuggle header line breaks into Reply-To.
const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]+$/;

/** @param {number} status @param {string} [error] */
const reply = (status, error) => Response.json(error ? { error } : { ok: true }, { status });

export default {
  /** @param {Request} request @param {{ TURNSTILE_SECRET: string, LETTERMINT_TOKEN: string, CONTACT_TO: string, CONTACT_FROM: string }} env */
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
    }
    // Browsers always send Content-Length with form data; a request without it would be read in full.
    const length = request.headers.get('Content-Length');
    if (!length || Number(length) > MAX_BODY) {
      return reply(413, 'That message is too long.');
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return reply(400, 'Something went wrong. Please try again.');
    }
    const field = (/** @type {string} */ name) => String(form.get(name) ?? '').trim();

    // Honeypot filled: pretend it worked so the bot learns nothing.
    if (field('_gotcha')) return reply(200);

    const email = field('email');
    const message = field('message');
    if (email.length > 254 || !EMAIL.test(email)) return reply(422, 'Please enter a valid email address.');
    // Lettermint rejects bodies under 3 characters.
    if (message.length < 3) return reply(422, 'Please enter a message.');
    if (message.length > MAX_MESSAGE) return reply(422, `Please keep the message under ${MAX_MESSAGE} characters.`);

    const check = await fetch(SITEVERIFY, {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: field('cf-turnstile-response'),
        remoteip: request.headers.get('CF-Connecting-IP') ?? '',
      }),
    })
      .then((r) => r.json())
      .catch(() => ({}));
    // The hostname check stops a token solved on another site that uses this sitekey.
    if (!check.success || check.hostname !== new URL(request.url).hostname) {
      return reply(403, 'The spam check failed. Please refresh and try again.');
    }

    const sent = await fetch(LETTERMINT, {
      method: 'POST',
      headers: { 'x-lettermint-token': env.LETTERMINT_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: [email],
        subject: `Contact form: ${email}`,
        text: message,
        tag: 'contact-form',
      }),
    }).catch(() => undefined);
    if (!sent?.ok) {
      // Visible in Workers Logs; the visitor only needs to know it didn't go through.
      console.error('Lettermint send failed', sent?.status, await sent?.text().catch(() => ''));
      return reply(502, 'Could not send your message. Please try again later.');
    }
    return reply(200);
  },
};
