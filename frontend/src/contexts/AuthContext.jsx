import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

// helper to avoid JSON.parse("undefined") errors
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

    }));

    const [csrf, setCsrf] = useState(safeJSONParse("csrf"))

    useEffect(() => {
        // keep localStorage in sync
        localStorage.setItem("authenticated", JSON.stringify(authState.isAuthenticated));
        localStorage.setItem("twoFactorVerified", JSON.stringify(authState.isTwoFactorVerified));
        localStorage.setItem("twoFactorPending", JSON.stringify(authState.isTwoFactorPending));
        localStorage.setItem("role", JSON.stringify(authState.role));
        localStorage.setItem("userId", JSON.stringify(authState.userId));
        localStorage.setItem("qr", JSON.stringify(authState.qr));
    }, [authState]);




    return (
        <AuthContext.Provider value={{ authState, setAuthState, csrf, setCsrf }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
