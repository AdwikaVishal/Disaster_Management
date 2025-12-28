import { AuthService } from './auth.service';

export interface VolunteerApplication {
    id: number;
    userId: number;
    volunteerType: string;
    skills: string;
    experience: string;
    availability: string;
    motivation: string;
    emergencyTraining: boolean | string;
    certifications?: string;
    alternatePhone?: string;
    emergencyContact?: string;
    maxDistanceKm?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    reviewedAt?: string;
    reviewNotes?: string;
    user?: any;
}

export interface CreateVolunteerApplicationData {
    volunteerType: string;
    skills: string;
    experience: string;
    availability: string;
    motivation: string;
    emergencyTraining: boolean | string;
    certifications?: string;
    alternatePhone?: string;
    emergencyContact?: string;
    maxDistanceKm?: number;
}

const API_URL = '/api/volunteers';

export const VolunteerService = {
    // Submit volunteer application - REAL BACKEND
    submitApplication: async (data: CreateVolunteerApplicationData): Promise<{ success: boolean; message?: string; application?: VolunteerApplication }> => {
        try {
            const token = AuthService.getToken();
            if (!token) {
                return { success: false, message: 'User not authenticated' };
            }

            // Convert boolean to string for backend
            const requestData = {
                ...data,
                emergencyTraining: data.emergencyTraining ? 'true' : 'false'
            };

            const response = await fetch(`${API_URL}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Submit application error:', error);
            return { success: false, message: 'Failed to submit application' };
        }
    },

    // Get all applications (for admin) - REAL BACKEND
    getAllApplications: async (): Promise<{ success: boolean; applications?: VolunteerApplication[]; message?: string }> => {
        try {
            const token = AuthService.getToken();
            if (!token) {
                return { success: false, message: 'Not authenticated' };
            }

            const response = await fetch(`${API_URL}/applications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Get applications error:', error);
            return { success: false, message: 'Failed to fetch applications' };
        }
    },

    // Get user's applications - REAL BACKEND
    getMyApplications: async (): Promise<{ success: boolean; applications?: VolunteerApplication[]; message?: string }> => {
        try {
            const token = AuthService.getToken();
            if (!token) {
                return { success: false, message: 'User not authenticated' };
            }

            const response = await fetch(`${API_URL}/applications/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Get my applications error:', error);
            return { success: false, message: 'Failed to fetch applications' };
        }
    },

    // Update application status (admin only) - REAL BACKEND
    updateApplicationStatus: async (id: number, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const token = AuthService.getToken();
            if (!token) {
                return { success: false, message: 'Not authenticated' };
            }

            const response = await fetch(`${API_URL}/applications/${id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    decision: status,
                    reviewNotes: notes || ''
                }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Update application error:', error);
            return { success: false, message: 'Failed to update application' };
        }
    }
};
