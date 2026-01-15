"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNav = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: 'Today', path: '/today', icon: '☀️' },
        { label: 'Write', path: '/write', icon: '✏️' },
        { label: 'Progress', path: '/progress', icon: '🌱' },
    ];

    if (pathname === '/') return null; // Don't show on welcome screen

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(253, 253, 248, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--secondary)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 'calc(60px + env(safe-area-inset-bottom))',
            zIndex: 100,
        }}>
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    href={item.path}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        color: isActive(item.path) ? 'var(--primary)' : 'var(--foreground)',
                        opacity: isActive(item.path) ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        flex: 1,
                        height: '100%',
                    }}
                >
                    <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};
