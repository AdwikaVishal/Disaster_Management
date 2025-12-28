import { AuthResponse, User, Incident, BlockchainStatus } from "./types";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    auth: {
        signup: (data: Partial<User>) => fetchJson<AuthResponse>("/auth/signup", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        loginUser: (data: { email: string; password: string }) => fetchJson<AuthResponse>("/auth/login-user", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        requestAdminOtp: (email: string) => fetchJson<AuthResponse>("/auth/login-admin-otp", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),
        verifyOtp: (email: string, otp: string) => fetchJson<AuthResponse>("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
        }),
    },
    blockchain: {
        getStatus: () => fetchJson<BlockchainStatus>("/blockchain/status"),
        getAuditTrail: (incidentId: number) => fetchJson<any[]>(`/blockchain/audit/${incidentId}`),
    },
    incidents: {
        create: (data: Incident) => fetchJson<Incident>("/incidents", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        getAll: () => fetchJson<Incident[]>("/incidents"),
    }
};
