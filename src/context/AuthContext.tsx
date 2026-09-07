'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { UserWithoutPassword } from '@/types';

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
    const sessionRevision = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const revision = sessionRevision.current;
        let disposed = false;
        const timeout = setTimeout(() => controller.abort(), 10000);
        // A failed session check must never restore an unverified local identity.
        fetch('/api/auth/me', { signal: controller.signal, cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (!disposed && sessionRevision.current === revision) setUser(data.success ? data.data : null);
            })
            .catch(() => {
                if (!disposed && sessionRevision.current === revision) setUser(null);
            })
            .finally(() => {
                clearTimeout(timeout);
                if (!disposed && sessionRevision.current === revision) setIsLoading(false);
            });
        return () => {
            disposed = true;
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    const login = (userData: UserWithoutPassword) => {
        sessionRevision.current++;
        setUser(userData);
        setIsLoading(false);
    };

    const logout = async () => {
        sessionRevision.current++;
        setUser(null);
        setIsLoading(false);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Cookie cleanup is best-effort.
        }
    };

    return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
