export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "USER" | "ADMIN" | "VOLUNTEER";
    trustScore: number;
    verified: boolean;
    token?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
}

export interface Incident {
    id?: number;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    mediaUrl?: string;
    status?: string;
    riskScore?: number;
    fraudProbability?: number;
    blockchainTx?: string;
}

export interface BlockchainStatus {
    connected: boolean;
    network: string;
    address: string;
    blockNumber: number;
}
