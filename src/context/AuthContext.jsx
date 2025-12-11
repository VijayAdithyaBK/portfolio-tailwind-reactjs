import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('currentUser'); // Clear invalid data
        } finally {
            setLoading(false);
        }
    }, []);

    const hashPassword = async (password) => {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };

    const register = async (username, password) => {
        let users = {};
        try {
            users = JSON.parse(localStorage.getItem('users') || '{}');
        } catch (e) {
            users = {};
        }

        if (users[username]) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await hashPassword(password);
        users[username] = { username, password: hashedPassword, joined: new Date() };
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    };

    const login = async (username, password) => {
        let users = {};
        try {
            users = JSON.parse(localStorage.getItem('users') || '{}');
        } catch (e) {
            users = {};
        }

        const user = users[username];

        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new Error('Invalid password');
        }

        const currentUser = { username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        setUser(currentUser);
        return true;
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
