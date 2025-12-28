import { AuthService } from './auth.service';

export interface Incident {
    id: number;
    title: string;
    description: string;
    type: string;
    severity: string;
    status: string;
    latitude: number;
    longitude: number;
    address?: string;
    landmark?: string;
    mediaUrls?: string[];
    injuriesReported?: number;
    peopleInvolved?: number;
    createdAt: string;
    reporter?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        trustScore: number;
    };
}

export interface CreateIncidentData {
    title: string;
    description: string;
    type: string;
    severity: string;
    latitude: number;
    longitude: number;
    address?: string;
    landmark?: string;
    mediaUrls?: string[];
    injuriesReported?: number;
    peopleInvolved?: number;
    tags?: string[];
}

const API_URL = `${import.meta.env.VITE_API_URL}/incidents`;

const handleResponse = async (response: Response): Promise<any> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error("Server returned non-JSON response");
        }
    }
};

export const IncidentService = {
    // Create a new incident - REAL BACKEND
    createIncident: async (data: CreateIncidentData): Promise<{ success: boolean; message?: string; incident?: Incident }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            return await handleResponse(response);
        } catch (error) {
            console.error('Create incident error:', error);
            return { success: false, message: 'Failed to create incident' };
        }
    },

    // Get all recent incidents - REAL BACKEND
    getAllIncidents: async (hours: number = 24): Promise<{ success: boolean; incidents?: Incident[]; total?: number; message?: string }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_URL}?hours=${hours}`, { headers });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get incidents error:', error);
            return { success: false, message: 'Failed to fetch incidents' };
        }
    },

    // Get nearby incidents - REAL BACKEND
    getNearbyIncidents: async (latitude: number, longitude: number, radiusKm: number = 10): Promise<{ success: boolean; incidents?: Incident[]; message?: string }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_URL}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`, { headers });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get nearby incidents error:', error);
            return { success: false, message: 'Failed to fetch nearby incidents' };
        }
    },

    // Get location info from coordinates - REAL BACKEND
    getLocationInfo: async (latitude: number, longitude: number): Promise<{ success: boolean; locationInfo?: any; message?: string }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_URL}/location-info?latitude=${latitude}&longitude=${longitude}`, { headers });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get location info error:', error);
            return { success: false, message: 'Failed to fetch location info' };
        }
    },

    // Get ML Severity Suggestion
    suggestSeverity: async (data: any): Promise<{ success: boolean; suggestedSeverity?: string; riskScore?: number; explanation?: string; message?: string }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/suggest-severity`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Severity suggestion error:', error);
            return { success: false, message: 'Failed to get severity suggestion' };
        }
    },

    // Get ML Emergency Recommendations
    getEmergencyRecommendations: async (data: any): Promise<{ success: boolean; recommendAmbulance?: boolean; recommendPolice?: boolean; recommendFire?: boolean; explanation?: string; message?: string }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/emergency-recommendations`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Emergency recommendation error:', error);
            return { success: false, message: 'Failed to get emergency recommendations' };
        }
    },

    // Check ML Service Health
    getMLHealth: async (): Promise<{ success: boolean; mlServiceAvailable?: boolean; status?: string; message?: string }> => {
        try {
            const token = AuthService.getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/ml-health`, {
                headers
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('ML health check error:', error);
            return { success: false, message: 'Failed to check ML health' };
        }
    },

    // Update Incident Status - REAL BACKEND
    updateIncidentStatus: async (id: number, status: 'VERIFIED' | 'REJECTED' | 'RESOLVED'): Promise<{ success: boolean; incident?: Incident; message?: string }> => {
        try {
            const token = AuthService.getToken();
            if (!token) return { success: false, message: 'Not authenticated' };

            const response = await fetch(`${API_URL}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Update status error:', error);
            return { success: false, message: 'Failed to update status' };
        }
    }
};
