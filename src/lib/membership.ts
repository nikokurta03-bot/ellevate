import { studioDateKey } from '@/lib/booking-time';

/** Membership stays valid through this many days before it is marked "uskoro ističe". */
export const MEMBERSHIP_DUE_SOON_DAYS = 7;

const MIN_PAID_ON = '2000-01-01';

export type MembershipStatus = 'missing' | 'active' | 'due_soon' | 'overdue';

export type MembershipSummary = {
    status: MembershipStatus;
    paidOn: string | null;
    validUntil: string | null;
    paidOnLabel: string | null;
    validUntilLabel: string | null;
    /** Days from today until validUntil. Negative once the membership has expired. */
    daysLeft: number | null;
};

export type MembershipCopy = {
    tone: 'neutral' | 'ok' | 'soon' | 'overdue';
    title: string;
    primary: string;
    secondary: string | null;
};

type ParsedPaymentDate = { date: Date | null } | { error: string };

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

export function isRealIsoDate(iso: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Calendar-month addition that clamps month-end dates (31.01. → 28.02. / 29.02.). */
export function addCalendarMonths(isoDate: string, months: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const monthIndex = month - 1 + months;
    const targetYear = year + Math.floor(monthIndex / 12);
    const targetMonth = ((monthIndex % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    const targetDay = Math.min(day, lastDay);
    return `${String(targetYear).padStart(4, '0')}-${pad(targetMonth + 1)}-${pad(targetDay)}`;
}

export function formatCroatianDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}.`;
}

export function diffCalendarDays(fromIso: string, toIso: string): number {
    const from = Date.parse(`${fromIso}T00:00:00.000Z`);
    const to = Date.parse(`${toIso}T00:00:00.000Z`);
    return Math.round((to - from) / 86_400_000);
}

export function toDateOnly(value: Date | string | null | undefined): string | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        const iso = value.toISOString().slice(0, 10);
        return isRealIsoDate(iso) ? iso : null;
    }
    if (typeof value !== 'string') return null;
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    if (!match || !isRealIsoDate(match[1])) return null;
    return match[1];
}

export function membershipSummary(
    paidOn: Date | string | null | undefined,
    now: Date = new Date(),
): MembershipSummary {
    const paid = toDateOnly(paidOn);
    if (!paid) {
        return {
            status: 'missing',
            paidOn: null,
            validUntil: null,
            paidOnLabel: null,
            validUntilLabel: null,
            daysLeft: null,
        };
    }

    const today = studioDateKey(now);
    const validUntil = addCalendarMonths(paid, 1);
    const daysLeft = diffCalendarDays(today, validUntil);
    const status: MembershipStatus = daysLeft < 0
        ? 'overdue'
        : daysLeft <= MEMBERSHIP_DUE_SOON_DAYS
            ? 'due_soon'
            : 'active';

    return {
        status,
        paidOn: paid,
        validUntil,
        paidOnLabel: formatCroatianDate(paid),
        validUntilLabel: formatCroatianDate(validUntil),
        daysLeft,
    };
}

export function membershipCopy(summary: MembershipSummary): MembershipCopy {
    if (summary.status === 'missing' || !summary.paidOnLabel || !summary.validUntilLabel) {
        return {
            tone: 'neutral',
            title: 'Članarina',
            primary: 'Datum plaćanja članarine još nije unesen.',
            secondary: 'Ako ste uplatile članarinu, javite se studiju.',
        };
    }

    const secondary = `Zadnje plaćanje: ${summary.paidOnLabel}`;
    if (summary.status === 'overdue') {
        return {
            tone: 'overdue',
            title: 'Članarina je istekla',
            primary: `Članarina je vrijedila do: ${summary.validUntilLabel}`,
            secondary,
        };
    }

    const primary = `Članarina vrijedi do: ${summary.validUntilLabel}`;
    if (summary.status === 'due_soon') {
        const daysLeft = summary.daysLeft ?? 0;
        const when = daysLeft === 0
            ? 'Obnova je danas.'
            : daysLeft === 1
                ? 'Obnova je sutra.'
                : `Obnova je za ${daysLeft} dana.`;
        return {
            tone: 'soon',
            title: 'Članarina uskoro ističe',
            primary,
            secondary: `${secondary} ${when}`,
        };
    }

    return {
        tone: 'ok',
        title: 'Članarina',
        primary,
        secondary,
    };
}

export function adminStatusLabel(status: MembershipStatus): string {
    switch (status) {
        case 'missing':
            return 'Nije uneseno';
        case 'active':
            return 'Važeća';
        case 'due_soon':
            return 'Uskoro ističe';
        case 'overdue':
            return 'Istekla';
    }
}

function croatianPlural(count: number, one: string, few: string, many: string): string {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

/** Sentence for the admin list, e.g. "2 članarine su istekle. 1 članarina ističe u sljedećih 7 dana." */
export function membershipAttentionText(overdue: number, soon: number): string | null {
    const parts: string[] = [];
    if (overdue > 0) {
        const phrase = croatianPlural(
            overdue,
            'članarina je istekla',
            'članarine su istekle',
            'članarina je isteklo',
        );
        parts.push(`${overdue} ${phrase}`);
    }
    if (soon > 0) {
        const phrase = croatianPlural(
            soon,
            'članarina ističe',
            'članarine ističu',
            'članarina ističe',
        );
        parts.push(`${soon} ${phrase} u sljedećih ${MEMBERSHIP_DUE_SOON_DAYS} dana`);
    }
    if (parts.length === 0) return null;
    return `${parts.join('. ')}.`;
}

/**
 * Accepts a date from the admin form (YYYY-MM-DD), empty to clear, and rejects
 * invalid or future dates. `todayIso` is the studio calendar date (Europe/Zagreb).
 */
export function parseMembershipPaidOn(value: unknown, todayIso: string): ParsedPaymentDate {
    if (value == null || value === '') return { date: null };
    if (typeof value !== 'string' || !isRealIsoDate(value)) {
        return { error: 'Datum plaćanja nije ispravan.' };
    }
    if (value < MIN_PAID_ON) {
        return { error: 'Datum plaćanja je predaleko u prošlosti.' };
    }
    if (value > todayIso) {
        return { error: 'Datum plaćanja ne može biti u budućnosti.' };
    }
    return { date: new Date(`${value}T00:00:00.000Z`) };
}
