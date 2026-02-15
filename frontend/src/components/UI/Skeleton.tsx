import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className = '',
    variant = 'text',
    width,
    height,
}: SkeletonProps) {
    const baseStyles = 'animate-pulse bg-gray-200';

    const variantStyles = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded',
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : undefined),
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
            aria-label="Loading..."
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                    <Skeleton className="mb-2" width="60%" />
                    <Skeleton width="40%" />
                </div>
            </div>
            <Skeleton className="mb-2" />
            <Skeleton className="mb-2" />
            <Skeleton width="80%" />
        </div>
    );
}
