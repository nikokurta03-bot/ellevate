import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import { formatInTimeZone } from 'date-fns-tz';
import { hr } from 'date-fns/locale';

let _resend: Resend | null = null;
function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
    return _resend;
}

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'mateazadar11@gmail.com';
const FROM_EMAIL = process.env.EMAIL_FROM || 'Ellevate <onboarding@resend.dev>';

function getDayName(date: Date): string {
    return formatInTimeZone(date, 'UTC', 'EEEE', { locale: hr });
}

function formatDate(date: Date): string {
    return formatInTimeZone(date, 'UTC', 'd. MMMM yyyy.', { locale: hr });
}

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 520px;
  margin: 0 auto;
  background: #0f172a;
  border-radius: 16px;
  overflow: hidden;
  color: #e2e8f0;
`;

function emailTemplate(title: string, emoji: string, accentColor: string, userName: string, slotDate: Date, slotTime: string) {
    const dayName = getDayName(slotDate);
    const dateStr = formatDate(slotDate);

    return `
    <div style="${baseStyle}">
      <div style="background: linear-gradient(135deg, ${accentColor}, ${accentColor}88); padding: 28px 24px; text-align: center;">
        <div style="font-size: 36px; margin-bottom: 8px;">${emoji}</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #fff;">${title}</h1>
      </div>
      <div style="padding: 28px 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #94a3b8; font-size: 13px;">Korisnik</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 15px; color: #f1f5f9;">${userName}</td>
          </tr>
          <tr style="border-top: 1px solid #1e293b;">
            <td style="padding: 10px 0; color: #94a3b8; font-size: 13px;">Dan</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 15px; color: #f1f5f9;">${dayName}</td>
          </tr>
          <tr style="border-top: 1px solid #1e293b;">
            <td style="padding: 10px 0; color: #94a3b8; font-size: 13px;">Datum</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 15px; color: #f1f5f9;">${dateStr}</td>
          </tr>
          <tr style="border-top: 1px solid #1e293b;">
            <td style="padding: 10px 0; color: #94a3b8; font-size: 13px;">Vrijeme</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 15px; color: #f1f5f9;">${slotTime}</td>
          </tr>
        </table>
      </div>
      <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
        <span style="font-size: 11px; color: #475569;">Ellevate Fitness Studio</span>
      </div>
    </div>
    `;
}

export async function sendBookingNotification(
    userName: string,
    slotDate: Date,
    slotTime: string,
) {
    try {
        const resend = getResend();
        if (!resend) return;
        await sendWithRetry(resend, {
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `✅ Nova prijava: ${userName} — ${slotTime}`,
            html: emailTemplate(
                'Nova Prijava na Trening',
                '🏋️',
                '#10b981',
                userName,
                slotDate,
                slotTime,
            ),
        });
    } catch (err) {
        console.error('Failed to send booking email:', err);
    }
}

export async function sendCancellationNotification(
    userName: string,
    slotDate: Date,
    slotTime: string,
) {
    try {
        const resend = getResend();
        if (!resend) return;
        await sendWithRetry(resend, {
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `❌ Otkaz: ${userName} — ${slotTime}`,
            html: emailTemplate(
                'Otkazana Rezervacija',
                '🚫',
                '#ef4444',
                userName,
                slotDate,
                slotTime,
            ),
        });
    } catch (err) {
        console.error('Failed to send cancellation email:', err);
    }
}

async function sendWithRetry(resend: Resend, message: Parameters<Resend['emails']['send']>[0]) {
    const idempotencyKey = randomUUID();
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await resend.emails.send(message, { idempotencyKey });
            if (!result.error) return;
            if (attempt === 2) console.error('Notification delivery failed:', result.error.name);
        } catch (error) {
            if (attempt === 2) console.error('Notification delivery failed:', error instanceof Error ? error.name : 'Network error');
        }
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
}

export async function sendMembershipEnquiry(enquiry: import('./enquiry').Enquiry) {
    const { enquiryMessage } = await import('./enquiry');
    const resend = getResend();
    if (!resend) throw new Error('Mail service not configured');
    const result = await resend.emails.send({
        ...enquiryMessage(enquiry),
        from: FROM_EMAIL,
        to: 'mateazadar11@gmail.com',
    }, { idempotencyKey: `membership-enquiry/${enquiry.requestId}` });
    if (result.error || !result.data?.id) throw new Error('Mail service did not accept enquiry');
}
