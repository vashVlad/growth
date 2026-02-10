import { useState, useEffect } from 'react';
import { SafeStorage } from '@/utils/storage';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Initialize theme from local storage or system preference
        const savedTheme = SafeStorage.getItem<string | null>('theme', null);

        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            setTheme('light');
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'dark') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            SafeStorage.setItem('theme', 'light');
            setTheme('light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            SafeStorage.setItem('theme', 'dark');
            setTheme('dark');
        }
    };

    return { theme, toggleTheme };
}
