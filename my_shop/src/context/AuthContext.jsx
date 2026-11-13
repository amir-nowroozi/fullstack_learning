/* ==========================================================
   context/AuthContext.jsx — احراز هویت با API بک‌اند
   - توکن JWT در localStorage (کلید shop_token)
   - روی بارگذاری اول، /api/auth/me را صدا می‌زند تا توکن را تأیید کند
   ========================================================== */

import {
    createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import { apiFetch, getToken, setToken } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------- روی بارگذاری: توکن را تأیید کن ---------- */
    useEffect(() => {
        (async () => {
            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiFetch('/api/auth/me');
                setUser(data.user);
            } catch {
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ---------- ثبت‌نام ---------- */
    const register = useCallback(async ({ email, password, fullName, phone }) => {
        const res = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName, phone }),
        });
        setToken(res.token);
        setUser(res.user);
        return res.user;
    }, []);

    /* ---------- ورود ---------- */
    const login = useCallback(async (email, password) => {
        const res = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(res.token);
        setUser(res.user);
        return res.user;
    }, []);

    /* ---------- خروج ---------- */
    const logout = useCallback(() => {
        setToken(null);
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