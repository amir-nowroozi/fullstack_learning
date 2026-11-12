import {
    createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import {
    registerUser, verifyLogin,
    saveSession, loadSession, clearSession,
    findUserById,
} from '../lib/authLogic';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* بازیابی session هنگام بارگذاری */
    useEffect(() => {
        const session = loadSession();
        if (session?.userId) {
            const stored = findUserById(session.userId);
            if (stored) {
                const { passwordHash, ...safe } = stored;
                setUser(safe);
            } else {
                clearSession();
            }
        }
        setLoading(false);
    }, []);

    const register = useCallback(async (data) => {
        const newUser = await registerUser(data);
        saveSession(newUser);
        setUser(newUser);
        return newUser;
    }, []);

    const login = useCallback(async (email, password) => {
        const found = await verifyLogin(email, password);
        saveSession(found);
        setUser(found);
        return found;
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
    }), [user, loading, register, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}