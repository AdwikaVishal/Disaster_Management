export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN';
    trustScore: number;
    verified: boolean;
    phoneNumber?: string;
    token?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
    email?: string;
}

export interface LoginData {
    email: string;
    password?: string;
}

export interface SignupData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// Pre-configured test users for quick login (from backend database)
const TEST_USERS = [
    { email: 'john@example.com', password: 'password123', role: 'USER' },
    { email: 'jane@example.com', password: 'password123', role: 'USER' },
    { email: 'admin@sensesafe.com', password: 'admin123', role: 'ADMIN' },
];

const handleResponse = async (response: Response): Promise<any> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        // Attempt to parse anyway in case header is wrong, or return error
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error("Server returned non-JSON response");
        }
    }
};

export const AuthService = {
    // Real backend login
    loginUser: async (data: LoginData): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/login-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await handleResponse(response);

            if (result.success && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    },

    signup: async (data: SignupData): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    },

    verifySignupOtp: async (email: string, otp: string): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/verify-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const result = await handleResponse(response);
            if (result.success && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            return result;
        } catch (error) {
            console.error('Verify OTP error:', error);
            return { success: false, message: 'Verification network error' };
        }
    },

    requestAdminOtp: async (email: string): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/login-admin-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Request OTP error:', error);
            return { success: false, message: 'Failed to send OTP' };
        }
    },

    verifyAdminOtp: async (email: string, otp: string): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const result = await handleResponse(response);
            if (result.success && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            return result;
        } catch (error) {
            console.error('Verify admin OTP error:', error);
            return { success: false, message: 'OTP verification failed' };
        }
    },

    // Helper to get test users for quick login dropdown
    getTestUsers: () => TEST_USERS,

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};
