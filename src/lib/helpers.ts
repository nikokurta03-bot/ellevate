import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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
