export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  avatar?: string;
  trustScore?: number;
  reports?: number;
  lastActivity?: string;
  status?: 'active' | 'inactive' | 'flagged';
}

export type IncidentType = 'Accident' | 'Medical' | 'Fire' | 'Crime' | 'Other' | 'Fire Emergency' | 'Flood' | 'Medical Emergency' | 'Gas Leak' | 'Traffic Accident';
export type IncidentStatus = 'Pending' | 'Verified' | 'In Progress' | 'Resolved' | 'New';
export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Incident {
  id: string;
  type: IncidentType;
  description?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: IncidentStatus;
  severity: SeverityLevel;
  reporterId?: string;
  reporterName?: string;
  reportedBy?: string;
  reporterContact?: string;
  verifications?: number;
  flags?: number;
  media?: string[];
  timestamp: string;
  priorityScore?: number;
  requiredResources?: string[];
}

export interface Analytics {
  totalIncidents: number;
  pendingIncidents?: number;
  resolvedToday?: number;
  avgResponseTime?: number;
  riskLevels: number[];
  incidentsByType?: Record<string, number>;
  highRiskCount?: number;
  peopleReported?: number;
  avgApprovalTime?: number;
  notifications?: Notification[];
  resolvedIncidents?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'alert' | 'update' | 'info' | 'warning';
  incidentId?: string;
  timestamp: string;
  read: boolean;
}

export interface SafetyTip {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface MetricCardData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}