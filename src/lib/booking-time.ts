import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export const STUDIO_TIME_ZONE = 'Europe/Zagreb';
export const BOOKING_RULES = 'Za jutarnje treninge (prije 12:00) prijava je moguća do 21:00 prethodnog dana. Za ostale treninge prijava je moguća najkasnije 3 sata prije početka. Otkazivanje je moguće do 3 sata prije treninga. Sva vremena su po vremenu u Zagrebu.';

// TrainingSlot.date is a calendar date stored at UTC midnight, not a training instant.
export function slotDateKey(date: Date | string): string {
    return new Date(date).toISOString().slice(0, 10);
}

export function studioDateKey(now = new Date()): string {
    return formatInTimeZone(now, STUDIO_TIME_ZONE, 'yyyy-MM-dd');
}

export function trainingStart(date: Date | string, time: string): Date {
    return fromZonedTime(`${slotDateKey(date)}T${time}:00`, STUDIO_TIME_ZONE);
}

export function bookingDeadline(date: Date | string, time: string): Date {
    if (Number(time.split(':')[0]) < 12) {
        const previousDay = new Date(`${slotDateKey(date)}T00:00:00Z`);
        previousDay.setUTCDate(previousDay.getUTCDate() - 1);
        return fromZonedTime(`${slotDateKey(previousDay)}T21:00:00`, STUDIO_TIME_ZONE);
    }
    return new Date(trainingStart(date, time).getTime() - 3 * 60 * 60 * 1000);
}

export function canMakeReservation(date: Date | string, time: string, now = new Date()): boolean {
    return now.getTime() <= bookingDeadline(date, time).getTime();
}

export function canCancelReservation(date: Date | string, time: string, now = new Date()): boolean {
    return now.getTime() < trainingStart(date, time).getTime() - 3 * 60 * 60 * 1000;
}

export function bookingDeadlineLabel(date: Date | string, time: string): string {
    return formatInTimeZone(bookingDeadline(date, time), STUDIO_TIME_ZONE, 'd.M. HH:mm');
}
