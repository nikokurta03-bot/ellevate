import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { validateOrigin } from '@/lib/csrf';
import { parseEnquiry } from '@/lib/enquiry';
import { createEnquiryLimiter } from '@/lib/enquiry-limiter';
import { sendMembershipEnquiry } from '@/lib/email';

export const maxDuration = 30;
const allow = createEnquiryLimiter();
const failure = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    if (!request.headers.get('origin')) return failure('Nedopušten zahtjev.', 403);
    if (!request.headers.get('content-type')?.includes('application/json')) return failure('Neispravan format zahtjeva.', 415);
    const reader = request.body?.getReader();
    if (!reader) return failure('Ispunite obavezna polja.', 400);
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > 12000) { await reader.cancel(); return failure('Poruka je preduga.', 413); }
            chunks.push(value);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (body?.website) return failure('Upit nije prihvaćen.', 400);
        const enquiry = parseEnquiry(body);
        if (!enquiry) return failure('Provjerite ime, prezime, e-mail i duljinu poruke.', 400);
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const hash = (value: string) => createHash('sha256').update(value).digest('hex');
        if (!allow([`ip:${hash(ip)}`, `email:${hash(enquiry.email)}`])) {
            return NextResponse.json({ success: false, error: 'Poslali ste više upita. Pokušajte ponovno za 10 minuta.' }, { status: 429, headers: { 'Retry-After': '600' } });
        }
        // Wait for provider acceptance: never show success for a dropped message.
        await sendMembershipEnquiry(enquiry);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof SyntaxError) return failure('Neispravan format zahtjeva.', 400);
        // Do not log the form contents, addresses or provider payload.
        console.error('Membership enquiry delivery failed');
        return failure('Upit trenutačno nije moguće poslati. Pokušajte ponovno za nekoliko minuta.', 503);
    }
}
