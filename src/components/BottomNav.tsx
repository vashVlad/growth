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
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    href={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};
