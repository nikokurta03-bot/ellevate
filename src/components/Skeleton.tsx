'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

// 🚀 OPTIMIZACIJA: Skeleton loading komponenta za bolji UX
export default function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-white/10 rounded';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}

// Skeleton za karticu statistike
export function StatCardSkeleton() {
    return (
        <div className="glass-card">
            <Skeleton variant="text" width="60%" height={14} className="mb-2" />
            <Skeleton variant="text" width="40%" height={36} className="mb-4" />
            <Skeleton variant="text" width="80%" height={12} />
        </div>
    );
}

// Skeleton za slot karticu
export function SlotCardSkeleton() {
    return (
        <div className="glass-card">
            <div className="flex justify-between items-start mb-4">
                <Skeleton width={100} height={28} />
                <Skeleton width={80} height={24} />
            </div>
            <Skeleton variant="text" width="70%" className="mb-2" />
            <Skeleton height={8} className="mb-6" />
            <Skeleton height={40} />
        </div>
    );
}

// Skeleton za raspored dan
export function ScheduleDaySkeleton() {
    return (
        <div className="space-y-6">
            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <Skeleton variant="text" width="60%" height={14} className="mx-auto mb-2" />
                <Skeleton variant="text" width="40%" height={28} className="mx-auto" />
            </div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="glass-card p-4">
                        <div className="flex justify-between items-center mb-4">
                            <Skeleton width={60} height={24} />
                            <Skeleton width={70} height={18} />
                        </div>
                        <Skeleton height={36} />
                    </div>
                ))}
            </div>
        </div>
    );
}
