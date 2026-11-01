import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isRealIsoDate } from './membership';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const email = value.trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
    return email;
}

/** Calendar date stored at UTC midnight. Empty input clears the value. */
export function parseOptionalIsoDate(value: unknown): { date: Date | null } | { error: string } {
    if (value == null || value === '') return { date: null };
    if (typeof value !== 'string' || !isRealIsoDate(value)) return { error: 'Datum nije ispravan.' };
    return { date: new Date(`${value}T00:00:00.000Z`) };
}

export function optionalPositiveNumber(value: unknown, integer: boolean): number | null {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number) || number <= 0) return null;
    const normalized = integer ? Math.round(number) : number;
    if (!Number.isFinite(normalized) || (integer && !Number.isSafeInteger(normalized))) return null;
    return normalized;
}

// Exclude password from user object
export function excludePassword<T extends { password: string }>(
    user: T
): Omit<T, 'password'> {
    const { password: _password, ...userWithoutPassword } = user;
    void _password;
    return userWithoutPassword;
}

// API error response helper
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
}

// API success response helper
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(
        { success: true, data },
        { status }
    );
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Validate OIB (Croatian personal identification number)
export function validateOIB(oib: string): boolean {
    if (!/^\d{11}$/.test(oib)) {
        return false;
    }

    let sum = 10;
    for (let i = 0; i < 10; i++) {
        sum = (sum + parseInt(oib[i])) % 10;
        sum = sum === 0 ? 10 : sum;
        sum = (sum * 2) % 11;
    }

    const checkDigit = (11 - sum) % 10;
    return checkDigit === parseInt(oib[10]);
}

// Get day name in Croatian
export function getDayName(date: Date): string {
    const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    return days[date.getDay()];
}
