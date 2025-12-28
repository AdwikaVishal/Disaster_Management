import { useState, useEffect, useCallback } from 'react';
import { incidentApi, IncidentWebSocket } from '../services/api';

export interface DashboardStats {
  activeIncidents: number;
  resolvedIncidents: number;
  highRiskCount: number;
  lowRiskCount: number;
  totalIncidents: number;
  recentIncidents: any[];
  riskRatio: {
    high: number;
    low: number;
  };
}

export const useRealTimeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeIncidents: 0,
    resolvedIncidents: 0,
    highRiskCount: 0,
    lowRiskCount: 0,
    totalIncidents: 0,
    recentIncidents: [],
    riskRatio: { high: 0, low: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // WebSocket for real-time updates
  const [webSocket, setWebSocket] = useState<IncidentWebSocket | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent incidents
      const incidentsResponse = await incidentApi.getAll(24);
      if (!incidentsResponse.success) {
        throw new Error(incidentsResponse.message || 'Failed to fetch incidents');
      }

      // Fetch statistics
      const statsResponse = await incidentApi.getStatistics(30);
      if (!statsResponse.success) {
        throw new Error(statsResponse.message || 'Failed to fetch statistics');
      }

      const incidents = incidentsResponse.incidents || [];
      const statistics = statsResponse.statistics || {};

      // Calculate dashboard stats
      const activeIncidents = incidents.filter((i: any) => 
        i.status !== 'RESOLVED' && i.status !== 'Resolved'
      ).length;

      const resolvedIncidents = incidents.filter((i: any) => 
        i.status === 'RESOLVED' || i.status === 'Resolved'
      ).length;

      const highRiskIncidents = incidents.filter((i: any) => 
        i.riskScore >= 70 || i.severity === 'CRITICAL' || i.severity === 'HIGH'
      ).length;

      const lowRiskIncidents = incidents.filter((i: any) => 
        i.riskScore < 70 && (i.severity === 'LOW' || i.severity === 'MEDIUM')
      ).length;

      const total = incidents.length;
      const riskRatio = total > 0 ? {
        high: Math.round((highRiskIncidents / total) * 100),
        low: Math.round((lowRiskIncidents / total) * 100),
      } : { high: 0, low: 0 };

      setStats({
        activeIncidents,
        resolvedIncidents,
        highRiskCount: highRiskIncidents,
        lowRiskCount: lowRiskIncidents,
        totalIncidents: total,
        recentIncidents: incidents.slice(0, 10),
        riskRatio,
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle real-time updates
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('Real-time update received:', data);
    
    // Refresh dashboard data when incidents are updated
    if (data.type === 'incident_update' || data.type === 'new_incident') {
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new IncidentWebSocket(handleWebSocketMessage);
    ws.connect();
    setWebSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, [handleWebSocketMessage]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Polling fallback (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const refresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
    webSocket,
  };
};