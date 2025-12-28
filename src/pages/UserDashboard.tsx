import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Bell,
  Map,
  User,
  Plus,
  MapPin,
  AlertTriangle,
  LogOut,
  Shield,
  ThumbsUp,
  Flag,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Phone,
  Zap,
  X,
  Settings,
  Edit,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import IncidentCard from '../components/IncidentCard';
import LiveIncidentMap from '../components/LiveIncidentMap';
import NotificationBell from '../components/NotificationBell';
import ReportModal from '../components/ReportModal';
import StatCard from '../components/StatCard';
import SOSButton from '../components/SOSButton';
import { useIncidents } from '../context/IncidentContext';
import { useAuth } from '../context/AuthContext';
import { sortByPriority, formatTimeAgo } from '../utils/helpers';
import { toast } from 'sonner';

type Tab = 'home' | 'reports' | 'alerts' | 'map' | 'profile';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { incidents, verifyIncident, flagIncident } = useIncidents();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Detecting location...');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const nearbyIncidents = sortByPriority(
    incidents.filter((i) => i.status !== 'Resolved')
  ).slice(0, 10);

  const myReports = incidents.filter((i) => i.reporterId === user?.id);
  const highPriorityAlerts = incidents.filter((i) => 
    (i.severity === 'Critical' || i.severity === 'High') && i.status !== 'Resolved'
  );

  useEffect(() => {
    setTimeout(() => {
      setCurrentLocation('Downtown Area, City Center');
    }, 2000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVerifyIncident = (id: string) => {
    verifyIncident(id);
    toast.success('Thank you for helping!', {
      description: 'Your verification helps keep the community safe.',
    });
  };

  const handleFlagIncident = (id: string) => {
    flagIncident(id);
    toast.success('Report flagged', {
      description: 'Thank you for helping maintain report quality.',
    });
  };

  const sidebarItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'reports', icon: FileText, label: 'My Reports' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'map', icon: Map, label: 'Live Map' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SenseSafe</h1>
              <p className="text-sm text-muted-foreground">Community Safety</p>
            </div>
          </div>
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Trust Score: {user?.trustScore || 85}</p>
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
              <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span className="truncate max-w-40">{currentLocation}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsReportModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white hidden md:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'home' && (
            <div className="space-y-6 fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="My Reports"
                  value={myReports.length}
                  subtitle="Total submitted"
                  icon={FileText}
                  variant="primary"
                />
                <StatCard
                  title="Verifications"
                  value="12"
                  subtitle="Community helps"
                  icon={ThumbsUp}
                  variant="success"
                />
                <StatCard
                  title="Trust Score"
                  value={user?.trustScore || 85}
                  subtitle="Community rating"
                  icon={Shield}
                  trend="up"
                  trendValue="5%"
                />
                <StatCard
                  title="Active Alerts"
                  value={highPriorityAlerts.length}
                  subtitle="In your area"
                  icon={AlertTriangle}
                  variant="warning"
                />
              </div>

              {/* Emergency Alert Banner */}
              {highPriorityAlerts.length > 0 && (
                <Card className="border-l-4 border-l-red-500 bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Active Emergency Alerts</p>
                        <p className="text-sm text-red-700">
                          {highPriorityAlerts.length} high-priority incidents near your location
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setIsReportModalOpen(true)}
                      className="h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                    >
                      <Plus className="w-6 h-6 mr-3" />
                      Report Incident
                    </Button>
                    <Button
                      onClick={() => setActiveTab('map')}
                      variant="outline"
                      className="h-16 text-lg font-semibold"
                    >
                      <Map className="w-6 h-6 mr-3" />
                      View Live Map
                    </Button>
                    <SOSButton
                      variant="inline"
                      size="lg"
                      className="h-16 text-lg font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Live Map + Community Verification */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Live Incident Map</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-gray-600">Live</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <LiveIncidentMap incidents={nearbyIncidents} className="h-64" />
                      <Button 
                        onClick={() => setActiveTab('map')}
                        size="sm" 
                        variant="outline" 
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur"
                      >
                        View Full Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Help Verify Reports</h3>
                      <Badge className="bg-blue-100 text-blue-700">Community</Badge>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {nearbyIncidents.slice(0, 3).map((incident) => (
                        <div
                          key={incident.id}
                          className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{incident.type}</h4>
                                <p className="text-xs text-gray-600">{formatTimeAgo(incident.timestamp)}</p>
                              </div>
                            </div>
                            <Badge className={`text-xs ${
                              incident.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                              incident.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                              incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerifyIncident(incident.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFlagIncident(incident.id)}
                              className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs"
                            >
                              <Flag className="w-3 h-3 mr-1" />
                              Flag
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
                <Button
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Report
                </Button>
              </div>

              {myReports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports yet</h3>
                    <p className="text-gray-600 mb-6">Help your community by reporting incidents you observe</p>
                    <Button
                      onClick={() => setIsReportModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Report
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Verifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReports.map((incident) => (
                        <tr key={incident.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {incident.type === 'Fire' ? '🔥' :
                                 incident.type === 'Accident' ? '🚗' :
                                 incident.type === 'Medical' ? '🏥' :
                                 incident.type === 'Crime' ? '🚨' : '⚠️'}
                              </span>
                              <span className="font-medium">{incident.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                            {incident.description}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${
                              incident.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                              incident.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {incident.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(incident.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-green-600" />
                              <span className="text-sm">{incident.verifications || 0}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recent Alerts</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">Live Updates</span>
                </div>
              </div>

              <div className="space-y-4">
                {highPriorityAlerts.map((incident, index) => (
                  <Card key={incident.id} className={`${
                    incident.severity === 'Critical' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-orange-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            incident.severity === 'Critical' ? 'bg-red-100' : 'bg-orange-100'
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${
                              incident.severity === 'Critical' ? 'text-red-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{incident.type}</h4>
                            <p className="text-sm text-gray-600">{incident.location.address}</p>
                          </div>
                        </div>
                        <Badge className={`${
                          incident.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {incident.severity}
                        </Badge>
                      </div>
                      {incident.description && (
                        <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyIncident(incident.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlagIncident(incident.id)}
                          className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Flag
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="fade-in h-[calc(100vh-12rem)]">
              <LiveIncidentMap incidents={nearbyIncidents} className="h-full rounded-xl" />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="fade-in space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">{user?.name}</h4>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Trust Score: {user?.trustScore || 85}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-600">{myReports.length}</p>
                      <p className="text-sm text-gray-600">Reports</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-sm text-gray-600">Verifications</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="w-4 h-4 mr-3" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border lg:hidden z-40">
        <div className="flex items-center justify-around py-2">
          {sidebarItems.map(({ id, icon: Icon, label }) => (
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

      {/* Floating SOS Button - Only on mobile */}
      <SOSButton className="lg:hidden" />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default UserDashboard;