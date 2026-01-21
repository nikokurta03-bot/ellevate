import { User, TrainingSlot, Reservation } from '@prisma/client';

// API Response types
export type ApiResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};

// User types
export type UserWithoutPassword = Omit<User, 'password'>;

export type CreateUserInput = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    oib: string;
    address?: string;
    dateOfBirth?: string;
    heightCm?: number;
    weightKg?: number;
    characteristics?: string;
    role?: 'admin' | 'user';
};

export type UpdateUserInput = Partial<CreateUserInput>;

// Training Slot types
export type TrainingSlotWithCount = TrainingSlot & {
    _count: {
        reservations: number;
    };
    currentCount: number;
    isFull: boolean;
    availableSpots: number;
    reservations?: (Reservation & {
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
        };
    })[];
};


// Reservation types
export type ReservationWithDetails = Reservation & {
    user: UserWithoutPassword;
    slot: TrainingSlot;
};

export type CreateReservationInput = {
    userId: number;
    slotId: number;
};

// Session/Auth types
export type SessionUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
};
