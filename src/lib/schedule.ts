export const SCHEDULE_EFFECTIVE_DATE = '2026-11-16';
export const TRAINING_TIMES = [
    { start: '09:00', end: '10:00' },
    { start: '17:15', end: '18:15' },
    { start: '18:15', end: '19:15' },
    { start: '19:20', end: '20:20' },
    { start: '20:30', end: '21:30' },
];

export function dateKey(date: Date | string): string {
    return typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10);
}

export function studioToday(now = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zagreb', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function validDate(value: unknown): value is string {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        && Number.isFinite(new Date(value).getTime()) && dateKey(new Date(value)) === value;
}

export function weekDates(offset: number, today = studioToday()): string[] {
    const monday = new Date(`${today}T00:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7 + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setUTCDate(date.getUTCDate() + i);
        return dateKey(date);
    });
}

export function slotsForDay(date: string) {
    return TRAINING_TIMES.filter(time => date >= SCHEDULE_EFFECTIVE_DATE || time.start !== '17:15').map(time => ({
        date: new Date(`${date}T00:00:00Z`), startTime: time.start, endTime: time.end,
        maxCapacity: date >= SCHEDULE_EFFECTIVE_DATE ? 9 : 8,
    }));
}
