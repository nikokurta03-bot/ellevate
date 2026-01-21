import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { UserWithoutPassword, CreateUserInput } from '@/types';

// Exclude password from user object
export function excludePassword<T extends { password: string }>(
    user: T
): Omit<T, 'password'> {
    const { password, ...userWithoutPassword } = user;
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

// Check if slot is full
export async function isSlotFull(slotId: number): Promise<boolean> {
    const slot = await prisma.trainingSlot.findUnique({
        where: { id: slotId },
        include: {
            _count: {
                select: {
                    reservations: {
                        where: { status: 'active' }
                    }
                }
            }
        }
    });

    if (!slot) return true;
    return slot._count.reservations >= slot.maxCapacity;
}

// Check if user can cancel reservation (1 hour before)
export function canCancelReservation(slotDate: Date, startTime: string): boolean {
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);

    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const oneHourBefore = new Date(slotDateTime.getTime() - 60 * 60 * 1000);

    return now < oneHourBefore;
}

// Get day name in Croatian
export function getDayName(date: Date): string {
    const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    return days[date.getDay()];
}
