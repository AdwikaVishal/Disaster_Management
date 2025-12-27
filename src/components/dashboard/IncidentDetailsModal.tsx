import { motion, AnimatePresence } from 'framer-motion';
import { Incident } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  X, 
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  MapIcon,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

const IncidentDetailsModal = ({ incident, isOpen, onClose }: IncidentDetailsModalProps) => {
  if (!incident) return null;

  const getSeverityConfig = (severity: Incident['severity']) => {
    const configs = {
      Low: { 
        badge: 'bg-green-100 text-green-800 border-green-200', 
        icon: '🟢',
        color: 'text-green-600'
      },
      Medium: { 
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: '🟡',
        color: 'text-yellow-600'
      },
      High: { 
        badge: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: '🟠',
        color: 'text-orange-600'
      },
      Critical: { 
        badge: 'bg-red-100 text-red-800 border-red-200', 
        icon: '🔴',
        color: 'text-red-600'
      },
    };
    return configs[severity];
  };

  const getStatusConfig = (status: Incident['status']) => {
    const configs = {
      New: { 
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        dot: 'bg-blue-500 animate-pulse'
      },
      'In Progress': { 
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-500'
      },
      Resolved: { 
        badge: 'bg-green-100 text-green-800 border-green-200',
        dot: 'bg-green-500'
      },
    };
    return configs[status];
  };

  const severityConfig = getSeverityConfig(incident.severity);
  const statusConfig = getStatusConfig(incident.status);

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
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="bg-background rounded-xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className={cn('w-3 h-3 rounded-full', statusConfig.dot)} />
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{incident.type}</h2>
                    <p className="text-sm text-muted-foreground">Incident ID: {incident.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn(severityConfig.badge, "border")}>
                    <span className="mr-1">{severityConfig.icon}</span>
                    {incident.severity}
                  </Badge>
                  <Badge className={cn(statusConfig.badge, "border")}>
                    {incident.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Incident Overview */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Incident Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Reported Time</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(incident.timestamp), 'PPpp')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">{incident.location.address}</p>
                              <p className="text-xs text-muted-foreground">
                                {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <User className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Reporter</p>
                              <p className="text-sm text-muted-foreground">{incident.reportedBy}</p>
                              {incident.reporterContact && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3" />
                                  <p className="text-xs text-muted-foreground">{incident.reporterContact}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {incident.description && (
                          <div className="pt-4 border-t border-border">
                            <p className="text-sm font-medium mb-2">Description</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {incident.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Mini Map Preview Placeholder */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapIcon className="h-5 w-5" />
                          Location Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Map preview would appear here</p>
                            <p className="text-xs text-muted-foreground">{incident.location.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Required Resources */}
                  <div className="space-y-6">
                    {incident.requiredResources && incident.requiredResources.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Required Resources
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {incident.requiredResources.map((resource, index) => (
                              <motion.div
                                key={resource}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-sm font-medium">{resource}</span>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full justify-start hover:bg-primary/90" variant="default">
                          <Users className="h-4 w-4 mr-2" />
                          Assign Responders
                        </Button>
                        <Button className="w-full justify-start hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" variant="outline">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Escalate Priority
                        </Button>
                        <Button className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          Track on Map
                        </Button>
                        {incident.status !== 'Resolved' && (
                          <Button className="w-full justify-start hover:bg-green-50 hover:text-green-700 hover:border-green-200" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Resolved
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IncidentDetailsModal;