import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_BASE_URL = 'http://localhost:8080/api';

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken && { Authorization: `Bearer ${authToken}` }),
});

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Incident API
export const incidentApi = {
  getAll: async (hours: number = 24): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents?hours=${hours}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getStatistics: async (days: number = 30): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/statistics?days=${days}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getCritical: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/critical`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getHighRisk: async (minRiskScore: number = 70): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/high-risk?minRiskScore=${minRiskScore}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (incident: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incident),
    });
    return response.json();
  },

  getSeveritySuggestion: async (suggestionData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/suggest-severity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(suggestionData),
    });
    return response.json();
  },

  getEmergencyRecommendations: async (incidentData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/emergency-recommendations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incidentData),
    });
    return response.json();
  },

  getAnalytics: async (hours: number = 24): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/analytics?hours=${hours}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getMLHealth: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/incidents/ml-health`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Volunteer API
export const volunteerApi = {
  apply: async (application: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/volunteers/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(application),
    });
    return response.json();
  },

  getApplications: async (status?: string): Promise<ApiResponse> => {
    const url = status 
      ? `${API_BASE_URL}/volunteers/applications?status=${status}`
      : `${API_BASE_URL}/volunteers/applications`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getMyApplications: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/volunteers/applications/my`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getStatistics: async (days: number = 30): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/volunteers/statistics?days=${days}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  reviewApplication: async (id: number, decision: string, notes?: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/volunteers/applications/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ decision, reviewNotes: notes }),
    });
    return response.json();
  },
};

// Emergency API
export const emergencyApi = {
  sendSOS: async (sosData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/emergency/sos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sosData),
    });
    return response.json();
  },

  getEmergencyContacts: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getUserContacts: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/emergency/user-contacts`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  updateContacts: async (contacts: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/emergency/update-contacts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contacts),
    });
    return response.json();
  },

  dialHospital: async (hospitalData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/emergency/dial-hospital`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(hospitalData),
    });
    return response.json();
  },
};

// Auth API
export const authApi = {
  signup: async (userData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  loginUser: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  loginAdminOtp: async (email: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login-admin-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  verifyOtp: async (email: string, otp: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return response.json();
  },

  validateToken: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Blockchain API
export const blockchainApi = {
  verifyIncident: async (incidentId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/blockchain/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ incidentId }),
    });
    return response.json();
  },

  assignResource: async (incidentId: number, resourceId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/blockchain/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ incidentId, resourceId }),
    });
    return response.json();
  },

  resolveIncident: async (incidentId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/blockchain/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ incidentId }),
    });
    return response.json();
  },

  getAuditTrail: async (incidentId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/blockchain/audit/${incidentId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  healthCheck: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/blockchain/health`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getStatus: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/blockchain/status`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// WebSocket connection for real-time updates using STOMP
export class IncidentWebSocket {
  private stompClient: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private onMessage: (data: any) => void) {}

  connect() {
    try {
      // Create STOMP client with SockJS
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws/incidents'),
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = (frame) => {
        console.log('WebSocket connected:', frame);
        this.reconnectAttempts = 0;
        
        // Subscribe to incident updates
        this.stompClient?.subscribe('/topic/incidents', (message) => {
          try {
            const data = JSON.parse(message.body);
            this.onMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        this.reconnect();
      };

      this.stompClient.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        this.reconnect();
      };

      this.stompClient.activate();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  send(data: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/incident',
        body: JSON.stringify(data),
      });
    }
  }
}