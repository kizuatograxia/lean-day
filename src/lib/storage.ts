/**
 * Centralized utility for managing localStorage with basic obfuscation.
 * This provides a single point of failure/improvement for security.
 */

const KEYS = {
    AUTH_TOKEN: "auth_token",
    SESSION_DATA: "luckynft_session",
    ADMIN_KEY: "admin_key",
    ADMIN_REVIEWS: "admin_reviews"
};

// Simple obfuscation to prevent casual reading of tokens in plain text
// For production, consider using SubtleCrypto for better security
const obfuscate = (data: string) => btoa(data);
const deobfuscate = (data: string) => {
    try {
        return atob(data);
    } catch {
        return data; // Fallback to raw if not base64
    }
};

export const storage = {
    getToken: () => {
        const token = localStorage.getItem(KEYS.AUTH_TOKEN);
        return token ? deobfuscate(token) : null;
    },

    setToken: (token: string) => {
        localStorage.setItem(KEYS.AUTH_TOKEN, obfuscate(token));
    },

    removeToken: () => {
        localStorage.removeItem(KEYS.AUTH_TOKEN);
    },

    getUser: () => {
        const data = localStorage.getItem(KEYS.SESSION_DATA);
        if (!data) return null;
        try {
            return JSON.parse(deobfuscate(data));
        } catch {
            return null;
        }
    },

    setUser: (user: any) => {
        localStorage.setItem(KEYS.SESSION_DATA, obfuscate(JSON.stringify(user)));
    },

    removeUser: () => {
        localStorage.removeItem(KEYS.SESSION_DATA);
        localStorage.removeItem("user"); // Cleanup legacy key
    },

    getAdminKey: () => {
        const key = localStorage.getItem(KEYS.ADMIN_KEY);
        return key ? deobfuscate(key) : null;
    },

    setAdminKey: (key: string) => {
        localStorage.setItem(KEYS.ADMIN_KEY, obfuscate(key));
    },

    removeAdminKey: () => {
        localStorage.removeItem(KEYS.ADMIN_KEY);
    },

    getReviews: () => {
        const data = localStorage.getItem(KEYS.ADMIN_REVIEWS);
        return data ? JSON.parse(deobfuscate(data)) : [];
    },

    setReviews: (reviews: any[]) => {
        localStorage.setItem(KEYS.ADMIN_REVIEWS, obfuscate(JSON.stringify(reviews)));
    },

    clearAll: () => {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        localStorage.removeItem("user");
    }
};
