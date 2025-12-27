import { motion } from 'framer-motion';
import { useState } from 'react';
import { Incident } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, User } from 'lucide-react';
import IncidentDetailsModal from './IncidentDetailsModal';

interface RecentIncidentsProps {
  incidents: Incident[];
}

const RecentIncidents = ({ incidents }: RecentIncidentsProps) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
  };
  const getSeverityBadge = (severity: Incident['severity']) => {
    const styles = {
      Low: 'status-badge-info',
      Medium: 'status-badge-warning',
      High: 'status-badge bg-orange-100 text-orange-700',
      Critical: 'status-badge-danger',
    };
    return styles[severity];
  };

  const getStatusDot = (status: Incident['status']) => {
    const colors = {
      New: 'bg-warning animate-pulse-soft',
      'In Progress': 'bg-primary',
      Resolved: 'bg-success',
    };
    return colors[status];
  };

  return (
    <motion.div
      className="card-elevated p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Incidents</h3>
          <p className="text-sm text-muted-foreground">Latest reported incidents</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {incidents.map((incident, index) => (
          <motion.div
            key={incident.id}
            className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ x: 4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleIncidentClick(incident)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-2.5 h-2.5 rounded-full', getStatusDot(incident.status))} />
                <div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{incident.type}</h4>
                  <p className="text-xs text-muted-foreground">{incident.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={getSeverityBadge(incident.severity)}>{incident.severity}</span>
                <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{incident.location.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{incident.reportedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
};

export default RecentIncidents;
