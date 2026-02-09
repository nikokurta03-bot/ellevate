'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserWithoutPassword } from '@/types';

type AuthContextType = {
    user: UserWithoutPassword | null;
    login: (user: UserWithoutPassword) => void;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserWithoutPassword | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('ellevate_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            localStorage.removeItem('ellevate_user');
        }
        setIsLoading(false);
    }, []);

    const login = (userData: UserWithoutPassword) => {
        setUser(userData);
        localStorage.setItem('ellevate_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ellevate_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
