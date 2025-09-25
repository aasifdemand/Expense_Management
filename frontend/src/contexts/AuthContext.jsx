/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);


const safeJSONParse = (key, fallback = null) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(() => ({
        isAuthenticated: safeJSONParse("authenticated", false),
        isTwoFactorVerified: safeJSONParse("twoFactorVerified", false),
        isTwoFactorPending: safeJSONParse("twoFactorPending", false),
        role: safeJSONParse("role", null),
        userId: safeJSONParse("userId", null),
        qr: safeJSONParse("qr", null),
        user: safeJSONParse("user", null), // Added user object for consistency
    }));

    const [csrf, setCsrf] = useState(safeJSONParse("csrf"));
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        localStorage.setItem("authenticated", JSON.stringify(authState.isAuthenticated));
        localStorage.setItem("twoFactorVerified", JSON.stringify(authState.isTwoFactorVerified));
        localStorage.setItem("twoFactorPending", JSON.stringify(authState.isTwoFactorPending));
        localStorage.setItem("role", JSON.stringify(authState.role));
        localStorage.setItem("userId", JSON.stringify(authState.userId));
        localStorage.setItem("qr", JSON.stringify(authState.qr));
        localStorage.setItem("user", JSON.stringify(authState.user));
    }, [authState]);

    // Handle logout function
    const handleLogout = async () => {
        setLoading(true);
        try {
            // Clear all auth-related localStorage
            localStorage.removeItem("authenticated");
            localStorage.removeItem("twoFactorVerified");
            localStorage.removeItem("twoFactorPending");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("qr");
            localStorage.removeItem("user");
            localStorage.removeItem("csrf");

            // Reset auth state
            setAuthState({
                isAuthenticated: false,
                isTwoFactorVerified: false,
                isTwoFactorPending: false,
                role: null,
                userId: null,
                qr: null,
                user: null,
            });

            setCsrf(null);

            // Optional: Make API call to logout on server if needed
            // await fetch('/api/logout', { method: 'POST' });

            console.log("Logout successful");

        } catch (error) {
            console.error("Logout error:", error);
            // Even if there's an error, clear local state
            localStorage.clear();
            setAuthState({
                isAuthenticated: false,
                isTwoFactorVerified: false,
                isTwoFactorPending: false,
                role: null,
                userId: null,
                qr: null,
                user: null,
            });
            setCsrf(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            authState,
            setAuthState,
            csrf,
            setCsrf,
            handleLogout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);