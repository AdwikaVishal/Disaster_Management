import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User, LoginData, SignupData, AuthResponse } from '@/services/auth.service';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginUser: (data: LoginData) => Promise<AuthResponse>;
    loginAdminStep1: (email: string) => Promise<AuthResponse>;
    loginAdminStep2: (email: string, otp: string) => Promise<AuthResponse>;
    signup: (data: SignupData) => Promise<AuthResponse>;
    verifySignupOtp: (email: string, otp: string) => Promise<AuthResponse>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const loginUser = async (data: LoginData) => {
        const response = await AuthService.loginUser(data);
        if (response.success && response.user) {
            setUser(response.user);
        }
        return response;
    };

    const loginAdminStep1 = async (email: string) => {
        return await AuthService.requestAdminOtp(email);
    };

    const loginAdminStep2 = async (email: string, otp: string) => {
        const response = await AuthService.verifyAdminOtp(email, otp);
        if (response.success && response.user) {
            setUser(response.user);
        }
        return response;
    };

    const signup = async (data: SignupData) => {
        return await AuthService.signup(data);
    }

    const verifySignupOtp = async (email: string, otp: string) => {
        const response = await AuthService.verifySignupOtp(email, otp);
        if (response.success && response.user) {
            setUser(response.user);
        }
        return response;
    }

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginUser,
            loginAdminStep1,
            loginAdminStep2,
            signup,
            verifySignupOtp,
            logout,
            isAdmin: user?.role === 'ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
