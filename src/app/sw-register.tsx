"use client";
import { useEffect } from 'react';

export function SWRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .catch((error) => {
                    // Fail silently in production
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Service Worker registration failed:', error);
                    }
                });
        }
    }, []);

    return null;
}
