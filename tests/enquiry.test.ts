import assert from 'node:assert/strict';
import test from 'node:test';
import { enquiryMessage, parseEnquiry } from '../src/lib/enquiry';
import { createEnquiryLimiter } from '../src/lib/enquiry-limiter';

const input = {
    firstName: ' Ana ', lastName: ' Horvat ', email: 'ANA@example.com', phone: '+385 91 123 4567',
    message: 'Želim informacije o članstvu.', requestId: 'ebcd6f54-7b60-48f7-b711-5fcb352136d3',
};
test('valid enquiry is normalized and optional fields may be empty', () => {
    const parsed = parseEnquiry({ ...input, phone: '', message: '' });
    assert.ok(parsed);
    assert.equal(parsed.firstName, 'Ana');
    assert.equal(parsed.lastName, 'Horvat');
    assert.equal(parsed.email, 'ana@example.com');
    assert.equal(parsed.phone, '');
});
test('invalid fields, oversized input and header injection are rejected', () => {
    for (const patch of [{ firstName: '' }, { email: 'not-an-email' }, { email: 'a@example.com\r\nBcc:b@example.com' }, { lastName: 'x\nHeader' }, { message: 'x'.repeat(2001) }, { phone: 123 }, { requestId: 'bad' }]) {
        assert.equal(parseEnquiry({ ...input, ...patch }), null);
    }
});
test('email contains all supplied details in plain text with fixed subject and reply-to', () => {
    const parsed = parseEnquiry({ ...input, message: '<script>not HTML</script>' });
    assert.ok(parsed);
    const message = enquiryMessage(parsed);
    assert.equal(message.replyTo, 'ana@example.com');
    assert.equal(message.subject, 'Novi upit za članstvo — Ellevate');
    assert.match(message.text, /Ime: Ana\nPrezime: Horvat/);
    assert.match(message.text, /Telefon: \+385 91 123 4567/);
    assert.match(message.text, /<script>not HTML<\/script>/);
    assert.equal('html' in message, false);
});
test('burst limit applies across requests and expires', () => {
    const allow = createEnquiryLimiter();
    for (let i = 0; i < 5; i++) assert.equal(allow(['ip', `email-${i}`], 0), true);
    assert.equal(allow(['ip', 'different-email'], 100), false);
    assert.equal(allow(['ip', 'different-email'], 600000), true);
});

test('delivery uses confirmed recipient, preserves idempotency and rejects provider failure', async (t) => {
    process.env.RESEND_API_KEY = 're_unit_test_only';
    const requests: { body: Record<string, unknown>; headers: Headers }[] = [];
    let providerFails = false;
    t.mock.method(globalThis, 'fetch', async (_url: unknown, options: RequestInit) => {
        requests.push({ body: JSON.parse(options.body as string), headers: new Headers(options.headers) });
        return new Response(JSON.stringify(providerFails
            ? { name: 'validation_error', message: 'Rejected' }
            : { id: 'mock-accepted-email' }), { status: providerFails ? 422 : 200 });
    });
    const { sendMembershipEnquiry } = await import('../src/lib/email');
    const enquiry = parseEnquiry(input)!;
    await sendMembershipEnquiry(enquiry);
    assert.equal(requests[0].body.to, 'mateazadar11@gmail.com');
    assert.equal(requests[0].body.reply_to, 'ana@example.com');
    assert.equal(requests[0].headers.get('idempotency-key'), `membership-enquiry/${input.requestId}`);
    providerFails = true;
    await assert.rejects(sendMembershipEnquiry(enquiry), /did not accept/);
    delete process.env.RESEND_API_KEY;
    await assert.rejects(sendMembershipEnquiry(enquiry), /not configured/);
});
