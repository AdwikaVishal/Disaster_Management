import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import MLStatusIndicator from './MLStatusIndicator';
import BlockchainStatusIndicator from './BlockchainStatusIndicator';
import BlockchainAuditTrail from './BlockchainAuditTrail';
import BlockchainIntegrationTest from './BlockchainIntegrationTest';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Brain,
  Shield,
} from 'lucide-react';
import { incidentApi, blockchainApi, IncidentWebSocket } from '../services/api';
import { toast } from 'sonner';

interface AnalyticsData {
  incidentsByType: Array<{ type: string; count: number; color: string }>;
  riskByArea: Array<{ area: string; riskScore: number; incidents: number; lat: number; lng: number }>;
  incidentsOverTime: Array<{ date: string; incidents: number; resolved: number; critical: number }>;
  severityDistribution: Array<{ severity: string; count: number; percentage: number }>;
  realTimeMetrics: {
    totalIncidents: number;
    activeIncidents: number;
    criticalIncidents: number;
    averageResponseTime: number;
    duplicateDetected: number;
    mlAccuracy: number;
  };
}

const COLORS = {
  FIRE: '#EF4444',
  FLOOD: '#3B82F6',
  VIOLENCE: '#DC2626',
  ROAD_ACCIDENT: '#F59E0B',
  GAS_LEAK: '#FBBF24',
  POWER_OUTAGE: '#6B7280',
  INFRASTRUCTURE_FAILURE: '#8B5CF6',
  MEDICAL_EMERGENCY: '#10B981',
  NATURAL_DISASTER: '#7C3AED',
  OTHER: '#6B7280',
};

const SEVERITY_COLORS = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626',
};

const AdminAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [webSocket, setWebSocket] = useState<IncidentWebSocket | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    if (realTimeUpdates) {
      setupWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.disconnect();
      }
    };
  }, [timeRange]);

  const setupWebSocket = () => {
    const ws = new IncidentWebSocket((data) => {
      if (data.type === 'NEW_INCIDENT' || data.type === 'INCIDENT_UPDATE' || data.type === 'STATUS_CHANGE') {
        // Refresh analytics data when incidents change
        loadAnalyticsData();
        toast.info('Analytics updated with new incident data');
      }
    });
    
    ws.connect();
    setWebSocket(ws);
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      
      // Fetch all required data
      const [incidentsResponse, statisticsResponse] = await Promise.all([
        incidentApi.getAll(hours),
        incidentApi.getStatistics(timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30),
      ]);

      if (incidentsResponse.success && statisticsResponse.success) {
        const incidents = incidentsResponse.incidents || [];
        const stats = statisticsResponse.statistics || {};

        // Process incidents by type
        const typeCount: Record<string, number> = {};
        incidents.forEach((incident: any) => {
          typeCount[incident.type] = (typeCount[incident.type] || 0) + 1;
        });

        const incidentsByType = Object.entries(typeCount).map(([type, count]) => ({
          type: type.replace('_', ' '),
          count,
          color: COLORS[type as keyof typeof COLORS] || COLORS.OTHER,
        }));

        // Process risk by area (group by approximate location)
        const areaRisk: Record<string, { riskScore: number; incidents: number; lat: number; lng: number; count: number }> = {};
        incidents.forEach((incident: any) => {
          const areaKey = `${Math.round(incident.latitude * 100) / 100},${Math.round(incident.longitude * 100) / 100}`;
          const area = incident.address?.split(',')[0] || `Area ${areaKey}`;
          
          if (!areaRisk[area]) {
            areaRisk[area] = { riskScore: 0, incidents: 0, lat: incident.latitude, lng: incident.longitude, count: 0 };
          }
          
          areaRisk[area].riskScore += incident.riskScore || 50;
          areaRisk[area].incidents += 1;
          areaRisk[area].count += 1;
        });

        const riskByArea = Object.entries(areaRisk).map(([area, data]) => ({
          area,
          riskScore: Math.round(data.riskScore / data.count),
          incidents: data.incidents,
          lat: data.lat,
          lng: data.lng,
        })).sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);

        // Process incidents over time
        const timeData: Record<string, { incidents: number; resolved: number; critical: number }> = {};
        const now = new Date();
        const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
        
        for (let i = daysBack - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          timeData[dateKey] = { incidents: 0, resolved: 0, critical: 0 };
        }

        incidents.forEach((incident: any) => {
          const incidentDate = new Date(incident.createdAt).toISOString().split('T')[0];
          if (timeData[incidentDate]) {
            timeData[incidentDate].incidents += 1;
            if (incident.status === 'RESOLVED') {
              timeData[incidentDate].resolved += 1;
            }
            if (incident.severity === 'CRITICAL') {
              timeData[incidentDate].critical += 1;
            }
          }
        });

        const incidentsOverTime = Object.entries(timeData).map(([date, data]) => ({
          date: new Date(date).toLocaleDateString(),
          ...data,
        }));

        // Process severity distribution
        const severityCount: Record<string, number> = {};
        incidents.forEach((incident: any) => {
          severityCount[incident.severity] = (severityCount[incident.severity] || 0) + 1;
        });

        const totalIncidents = incidents.length;
        const severityDistribution = Object.entries(severityCount).map(([severity, count]) => ({
          severity,
          count,
          percentage: Math.round((count / totalIncidents) * 100),
        }));

        // Calculate real-time metrics
        const activeIncidents = incidents.filter((i: any) => i.status === 'IN_PROGRESS' || i.status === 'NEW').length;
        const criticalIncidents = incidents.filter((i: any) => i.severity === 'CRITICAL').length;
        const duplicateDetected = incidents.filter((i: any) => i.similarityScore > 0.8).length;
        
        // Mock ML accuracy (in real app, this would come from ML service)
        const mlAccuracy = 87 + Math.random() * 10; // 87-97%

        const realTimeMetrics = {
          totalIncidents,
          activeIncidents,
          criticalIncidents,
          averageResponseTime: 12 + Math.random() * 8, // 12-20 minutes
          duplicateDetected,
          mlAccuracy: Math.round(mlAccuracy * 10) / 10,
        };

        setAnalyticsData({
          incidentsByType,
          riskByArea,
          incidentsOverTime,
          severityDistribution,
          realTimeMetrics,
        });
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      timeRange,
      ...analyticsData,
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensesafe-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time incident analytics and risk distribution
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          
          <Button onClick={loadAnalyticsData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Time Range:</span>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
            </Button>
          ))}
        </div>
        
        {/* ML Status Indicator */}
        <div className="ml-auto">
          <MLStatusIndicator />
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold">{analyticsData.realTimeMetrics.totalIncidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.realTimeMetrics.activeIncidents}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{analyticsData.realTimeMetrics.criticalIncidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{Math.round(analyticsData.realTimeMetrics.averageResponseTime)}m</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Duplicates</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.realTimeMetrics.duplicateDetected}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ML Accuracy</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.realTimeMetrics.mlAccuracy}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidents by Type - Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Type</CardTitle>
                <CardDescription>Distribution of incident types in the selected time range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.incidentsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count, percent }) => `${type}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.incidentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Severity Distribution - Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of incidents by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.severityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count">
                      {analyticsData.severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk by Area - Heat Map Data */}
            <Card>
              <CardHeader>
                <CardTitle>High-Risk Areas</CardTitle>
                <CardDescription>Areas with highest risk scores and incident counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.riskByArea.slice(0, 8).map((area, index) => (
                    <div key={area.area} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{area.area}</p>
                          <p className="text-sm text-gray-600">{area.incidents} incidents</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          area.riskScore >= 80 ? 'bg-red-100 text-red-700' :
                          area.riskScore >= 60 ? 'bg-orange-100 text-orange-700' :
                          area.riskScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          Risk: {area.riskScore}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
                <CardDescription>Distribution of risk scores across all areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.riskByArea}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="riskScore" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Incidents Over Time</CardTitle>
              <CardDescription>Timeline showing incident trends, resolutions, and critical incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.incidentsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="incidents" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ML Service Status */}
          <MLStatusIndicator showDetails={true} />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ML Status */}
            <MLStatusIndicator showDetails={true} />
            
            {/* Blockchain Status */}
            <BlockchainStatusIndicator showDetails={true} />
          </div>

          {/* Blockchain Integration Test */}
          <BlockchainIntegrationTest />

          {/* Sample Blockchain Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Sample Blockchain Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Blockchain audit trail for the most recent incident
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.realTimeMetrics.totalIncidents > 0 ? (
                <BlockchainAuditTrail incidentId={1} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No incidents available for audit trail display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${realTimeUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {realTimeUpdates ? 'Real-time updates active' : 'Real-time updates paused'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            >
              {realTimeUpdates ? 'Pause Updates' : 'Resume Updates'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsDashboard;