export function validDate(value: unknown): value is string {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= '1900-01-01';
}
export function nextPaymentDate(value: string): string {
    if (!validDate(value)) throw new Error('Neispravan datum');
    const [year, month, day] = value.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(day, lastDay))).toISOString().slice(0, 10);
}
export function displayDate(value: string): string {
    return value.split('-').reverse().join('.') + '.';
}
export type MembershipDates = { joinedOn: string; firstPaidOn: string; lastPaidOn: string; dueOn: string };
