import { Incident, SeverityLevel } from '../types';

export const getSeverityColor = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'Low':
      return 'bg-success text-success-foreground';
    case 'Medium':
      return 'bg-warning text-warning-foreground';
    case 'High':
      return 'bg-destructive text-destructive-foreground';
    case 'Critical':
      return 'bg-critical text-critical-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'bg-warning/20 text-warning border border-warning/30';
    case 'Verified':
      return 'bg-primary/20 text-primary border border-primary/30';
    case 'In Progress':
      return 'bg-accent/20 text-accent border border-accent/30';
    case 'Resolved':
      return 'bg-success/20 text-success border border-success/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'Fire':
      return '🔥';
    case 'Accident':
      return '🚗';
    case 'Medical':
      return '🏥';
    case 'Crime':
      return '🚨';
    case 'Other':
      return '⚠️';
    default:
      return '📍';
  }
};

export const calculatePriority = (incident: Incident): number => {
  const severityScore: Record<SeverityLevel, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };

  const base = severityScore[incident.severity] * 25;
  const verificationBonus = Math.min(incident.verifications * 2, 15);
  const recencyBonus = Math.max(0, 10 - Math.floor((Date.now() - new Date(incident.timestamp).getTime()) / (1000 * 60 * 10)));

  return Math.min(100, base + verificationBonus + recencyBonus);
};

export const sortByPriority = (incidents: Incident[]): Incident[] => {
  return [...incidents].sort((a, b) => {
    const priorityA = a.priorityScore ?? calculatePriority(a);
    const priorityB = b.priorityScore ?? calculatePriority(b);
    return priorityB - priorityA;
  });
};

export const formatTimeAgo = (timestamp: string): string => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
