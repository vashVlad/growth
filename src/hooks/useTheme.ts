import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Initialize theme from local storage or system preference
        const savedTheme = localStorage.getItem('theme');
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
            localStorage.setItem('theme', 'light');
            setTheme('light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        }
    };

    return { theme, toggleTheme };
}
