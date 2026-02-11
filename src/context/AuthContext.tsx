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
        // Verify session with server instead of trusting localStorage alone
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setUser(data.data);
                    localStorage.setItem('ellevate_user', JSON.stringify(data.data));
                } else {
                    setUser(null);
                    localStorage.removeItem('ellevate_user');
                }
            })
            .catch(() => {
                // Fallback to localStorage if network fails
                try {
                    const savedUser = localStorage.getItem('ellevate_user');
                    if (savedUser) setUser(JSON.parse(savedUser));
                } catch {
                    localStorage.removeItem('ellevate_user');
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = (userData: UserWithoutPassword) => {
        setUser(userData);
        localStorage.setItem('ellevate_user', JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('ellevate_user');
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            // Cookie cleanup is best-effort
        }
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
