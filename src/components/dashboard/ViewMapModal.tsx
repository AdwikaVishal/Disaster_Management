import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, 
  Map, 
  Filter, 
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dummyIncidents } from '@/data/dummyData';

interface ViewMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewMapModal = ({ isOpen, onClose }: ViewMapModalProps) => {
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    timeRange: 'all',
    status: 'all'
  });
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [mapView, setMapView] = useState({ zoom: 12, center: { lat: 12.97, lng: 77.59 } });

  const incidentTypes = ['all', 'Fire Emergency', 'Flood', 'Medical Emergency', 'Gas Leak', 'Traffic Accident'];
  const severityLevels = ['all', 'Low', 'Medium', 'High', 'Critical'];
  const timeRanges = [
    { value: 'all', label: 'All Time' },
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];
  const statusOptions = ['all', 'New', 'In Progress', 'Resolved'];

  const filteredIncidents = dummyIncidents.filter(incident => {
    if (filters.type !== 'all' && incident.type !== filters.type) return false;
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    // Add time range filtering logic here
    return true;
  });

  const selectedIncidentData = filteredIncidents.find(inc => inc.id === selectedIncident);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return { bg: 'bg-red-500', text: 'text-red-800', border: 'border-red-200' };
      case 'high': return { bg: 'bg-orange-500', text: 'text-orange-800', border: 'border-orange-200' };
      case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'low': return { bg: 'bg-green-500', text: 'text-green-800', border: 'border-green-200' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Full Screen Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="w-full h-full bg-background flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-purple-900">Real-Time Incident Map</h2>
                    <p className="text-sm text-purple-700">
                      Geographic view of all incidents with real-time updates
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 flex">
                {/* Sidebar - Filters & Incident List */}
                <div className="w-80 border-r bg-muted/30 flex flex-col">
                  {/* Filters */}
                  <div className="p-4 border-b">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Incident Type */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          INCIDENT TYPE
                        </label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {incidentTypes.map(type => (
                            <option key={type} value={type}>
                              {type === 'all' ? 'All Types' : type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Severity */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          SEVERITY
                        </label>
                        <select
                          value={filters.severity}
                          onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {severityLevels.map(level => (
                            <option key={level} value={level}>
                              {level === 'all' ? 'All Severities' : level}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Time Range */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          TIME RANGE
                        </label>
                        <select
                          value={filters.timeRange}
                          onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {timeRanges.map(range => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          STATUS
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status === 'all' ? 'All Statuses' : status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      Showing {filteredIncidents.length} of {dummyIncidents.length} incidents
                    </div>
                  </div>

                  {/* Incident List */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-2 space-y-2">
                      {filteredIncidents.map((incident) => {
                        const severityColors = getSeverityColor(incident.severity);
                        return (
                          <div
                            key={incident.id}
                            onClick={() => setSelectedIncident(incident.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedIncident === incident.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-border hover:border-purple-300 bg-background'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${severityColors.bg}`} />
                                <h4 className="font-medium text-sm">{incident.type}</h4>
                              </div>
                              <Badge className={getStatusColor(incident.status)}>
                                {incident.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{incident.location.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(incident.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main Map Area */}
                <div className="flex-1 relative">
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur">
                      <Layers className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur">
                      <Target className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Map Placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
                        {Array.from({ length: 96 }).map((_, i) => (
                          <div key={i} className="border border-gray-300" />
                        ))}
                      </div>
                    </div>

                    {/* Incident Markers */}
                    {filteredIncidents.map((incident, index) => {
                      const severityColors = getSeverityColor(incident.severity);
                      const x = 20 + (index % 8) * 120;
                      const y = 50 + Math.floor(index / 8) * 100;
                      
                      return (
                        <motion.div
                          key={incident.id}
                          className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                            selectedIncident === incident.id ? 'z-20 scale-125' : 'z-10'
                          }`}
                          style={{ left: x, top: y }}
                          onClick={() => setSelectedIncident(incident.id)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className={`w-6 h-6 rounded-full ${severityColors.bg} border-2 border-white shadow-lg flex items-center justify-center`}>
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </div>
                          {selectedIncident === incident.id && (
                            <motion.div
                              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 min-w-48"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="text-xs">
                                <div className="font-medium mb-1">{incident.type}</div>
                                <div className="text-muted-foreground mb-2">{incident.location.address}</div>
                                <div className="flex gap-1 mb-2">
                                  <Badge className={`${severityColors.text} bg-${severityColors.bg.split('-')[1]}-100 border-${severityColors.border.split('-')[1]}-200 text-xs`}>
                                    {incident.severity}
                                  </Badge>
                                  <Badge className={`${getStatusColor(incident.status)} text-xs`}>
                                    {incident.status}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                                    <Edit className="w-3 h-3 mr-1" />
                                    Update
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Map Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
                      <h4 className="text-xs font-medium mb-2">Severity Levels</h4>
                      <div className="space-y-1">
                        {['Low', 'Medium', 'High', 'Critical'].map(level => {
                          const colors = getSeverityColor(level);
                          return (
                            <div key={level} className="flex items-center gap-2 text-xs">
                              <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                              <span>{level}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Center Indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="border-t bg-muted/30 px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Real-time updates enabled</span>
                  <span>•</span>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ViewMapModal;