import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { studioDateKey } from '@/lib/booking-time';
import { displayDate } from '@/lib/membership';
export const maxDuration = 300;
export async function GET(request: NextRequest) {
    const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
    const actual = request.headers.get('authorization') || '';
    if (!process.env.CRON_SECRET || actual.length !== expected.length || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return new NextResponse('Unauthorized', { status: 401 });
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: 'Mail not configured' }, { status: 503 });
    const today = studioDateKey();
    const tomorrow = new Date(`${today}T00:00:00Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const dueOn = tomorrow.toISOString().slice(0, 10);
    const rows = await prisma.membership.findMany({ where: { dueOn, user: { role: 'user' }, OR: [{ remindedFor: null }, { remindedFor: { not: dueOn } }] }, include: { user: { select: { email: true } } } });
    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0, failed = 0;
    for (const row of rows) {
        const claimedAt = new Date();
        const claim = await prisma.membership.updateMany({ where: { userId: row.userId, dueOn, AND: [{ OR: [{ remindedFor: null }, { remindedFor: { not: dueOn } }] }, { OR: [{ claimedAt: null }, { claimedAt: { lt: new Date(Date.now() - 15 * 60000) } }] }] }, data: { claimedAt } });
        if (!claim.count) continue;
        try {
            const result = await resend.emails.send({ from: process.env.EMAIL_FROM, to: row.user.email, subject: `Ellevate — podsjetnik za uplatu ${displayDate(dueOn)}`, text: `Pozdrav!\n\nPodsjećamo vas da je sljedeća uplata za treninge predviđena sutra, ${displayDate(dueOn)}.\nAko ste već platili, javite Matei da ažurira evidenciju.\n\nSvoje datume možete vidjeti na https://www.ellevate.hr/dashboard\n\nEllevate` }, { idempotencyKey: `payment/${row.userId}/${dueOn}` });
            if (result.error || !result.data?.id) throw new Error('Delivery failed');
            await prisma.membership.updateMany({ where: { userId: row.userId, dueOn, claimedAt }, data: { remindedFor: dueOn, claimedAt: null } });
            sent++;
        } catch {
            await prisma.membership.updateMany({ where: { userId: row.userId, claimedAt }, data: { claimedAt: null } });
            failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 600));
    }
    return NextResponse.json({ sent, failed }, { status: failed ? 503 : 200 });
}
