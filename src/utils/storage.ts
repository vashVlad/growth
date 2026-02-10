/**
 * Safe local storage wrapper.
 * Handles SSR checks, JSON parsing, and error suppression.
 */

export class SafeStorage {
    static getItem<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue;

        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item) as T;
        } catch (error) {
            console.warn(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    }

    static setItem(key: string, value: any): void {
        if (typeof window === 'undefined') return;

        try {
            const serialized = JSON.stringify(value);
            window.localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
            // In a real app, might want to show a toast if quota exceeded
        }
    }

    static removeItem(key: string): void {
        if (typeof window === 'undefined') return;

        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
        }
    }

    /**
     * Safely parses a JSON string.
     * @param jsonString The string to parse
     * @param fallback Value to return if parsing fails
     */
    static safeParse<T>(jsonString: string, fallback: T): T {
        try {
            return JSON.parse(jsonString) as T;
        } catch {
            return fallback;
        }
    }
}
