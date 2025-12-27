import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  List,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import IncidentCard from '../components/IncidentCard';
import StatCard from '../components/StatCard';
import IncidentMap from '../components/IncidentMap';
import NotificationBell from '../components/NotificationBell';
import { useIncidents } from '../context/IncidentContext';
import { useAuth } from '../context/AuthContext';
import { sortByPriority, getStatusColor } from '../utils/helpers';
import { mockAnalytics } from '../data/mockData';

type Tab = 'dashboard' | 'map' | 'incidents' | 'users' | 'analytics' | 'settings';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { incidents, updateIncident } = useIncidents();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const sortedIncidents = sortByPriority(incidents);
  const filteredIncidents =
    statusFilter === 'all'
      ? sortedIncidents
      : sortedIncidents.filter((i) => i.status === statusFilter);

  const pendingCount = incidents.filter((i) => i.status === 'Pending').length;
  const inProgressCount = incidents.filter((i) => i.status === 'In Progress').length;
  const resolvedTodayCount = incidents.filter(
    (i) =>
      i.status === 'Resolved' &&
      new Date(i.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateIncident(id, { status: newStatus as any });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'map', icon: Map, label: 'Live Map' },
    { id: 'incidents', icon: List, label: 'Incidents' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">SenseSafe</h1>
          <p className="text-sm text-muted-foreground">Admin Console</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map(({ id, icon: Icon, label }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/command')}
                className="hidden md:flex bg-primary hover:bg-primary/90"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Switch to Command Center
              </Button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Pending Incidents"
                  value={pendingCount}
                  subtitle="Awaiting review"
                  icon={AlertTriangle}
                  variant="warning"
                />
                <StatCard
                  title="In Progress"
                  value={inProgressCount}
                  subtitle="Being handled"
                  icon={Clock}
                  variant="primary"
                />
                <StatCard
                  title="Resolved Today"
                  value={resolvedTodayCount}
                  subtitle="Successfully closed"
                  icon={CheckCircle}
                  variant="success"
                />
                <StatCard
                  title="Avg Response"
                  value={`${mockAnalytics.avgResponseTime}m`}
                  subtitle="Response time"
                  icon={TrendingUp}
                  trend="down"
                  trendValue="12%"
                />
              </div>

              {/* Map + Priority Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Live Map</h3>
                  <IncidentMap incidents={sortedIncidents} className="h-80" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Priority Queue</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sortedIncidents.slice(0, 5).map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        onClick={() => setActiveTab('incidents')}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="fade-in h-[calc(100vh-12rem)]">
              <IncidentMap incidents={sortedIncidents} className="h-full" />
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="fade-in">
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>
                {['all', 'Pending', 'Verified', 'In Progress', 'Resolved'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === status
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {status === 'all' ? 'All' : status}
                    </button>
                  )
                )}
              </div>

              {/* Incidents Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                        Severity
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((incident) => (
                      <tr
                        key={incident.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <span className="text-lg">
                            {incident.type === 'Fire'
                              ? '🔥'
                              : incident.type === 'Accident'
                              ? '🚗'
                              : incident.type === 'Medical'
                              ? '🏥'
                              : incident.type === 'Crime'
                              ? '🚨'
                              : '⚠️'}
                          </span>
                          <span className="ml-2 font-medium">{incident.type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {incident.description}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`status-badge ${
                              incident.severity === 'Critical'
                                ? 'bg-critical text-critical-foreground'
                                : incident.severity === 'High'
                                ? 'bg-destructive text-destructive-foreground'
                                : incident.severity === 'Medium'
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-success text-success-foreground'
                            }`}
                          >
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={incident.status}
                            onChange={(e) =>
                              handleStatusChange(incident.id, e.target.value)
                            }
                            className="text-sm px-2 py-1 bg-muted border border-border rounded-lg"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Incidents"
                  value={mockAnalytics.totalIncidents}
                  icon={List}
                />
                <StatCard
                  title="People Reported"
                  value="2.4k"
                  icon={Users}
                  trend="up"
                  trendValue="8%"
                />
                <StatCard
                  title="Avg Response"
                  value={`${mockAnalytics.avgResponseTime}m`}
                  icon={Clock}
                  trend="down"
                  trendValue="15%"
                />
                <StatCard
                  title="Resolution Rate"
                  value="94%"
                  icon={CheckCircle}
                  variant="success"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Incidents by Type</h3>
                  <div className="space-y-3">
                    {Object.entries(mockAnalytics.incidentsByType || {}).map(
                      ([type, count]) => (
                        <div key={type} className="flex items-center gap-3">
                          <span className="w-24 text-sm text-muted-foreground">
                            {type}
                          </span>
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{
                                width: `${((count as number) / mockAnalytics.totalIncidents) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {count as number}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
                  <div className="flex items-end justify-around h-48">
                    {['Low', 'Medium', 'High', 'Critical'].map((level, i) => (
                      <div key={level} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-16 rounded-t-lg transition-all ${
                            level === 'Low'
                              ? 'bg-success'
                              : level === 'Medium'
                              ? 'bg-warning'
                              : level === 'High'
                              ? 'bg-destructive'
                              : 'bg-critical'
                          }`}
                          style={{ height: `${mockAnalytics.riskLevels[i] * 4}px` }}
                        />
                        <span className="text-xs text-muted-foreground">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="fade-in">
              <p className="text-muted-foreground">User management coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="fade-in">
              <p className="text-muted-foreground">Settings coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border lg:hidden z-40">
        <div className="flex items-center justify-around py-2">
          {sidebarItems.slice(0, 5).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-item ${activeTab === id ? 'nav-item-active' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
