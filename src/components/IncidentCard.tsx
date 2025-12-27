import React from 'react';
import { Incident } from '../types';
import { getSeverityColor, getStatusColor, getTypeIcon, formatTimeAgo } from '../utils/helpers';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  showActions?: boolean;
  onVerify?: () => void;
  onFlag?: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onClick,
  showActions = false,
  onVerify,
  onFlag,
}) => {
  const priorityClass =
    incident.severity === 'Critical' || incident.severity === 'High'
      ? 'priority-high'
      : incident.severity === 'Medium'
      ? 'priority-medium'
      : 'priority-low';

  return (
    <div
      className={`incident-card ${priorityClass} cursor-pointer fade-in`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(incident.type)}</span>
          <div>
            <h3 className="font-semibold text-foreground">{incident.type}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {incident.description}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[120px]">
            {incident.location.address || 'Location'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(incident.timestamp)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{incident.verifications} verified</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className={`status-badge ${getSeverityColor(incident.severity)}`}>
          {incident.severity}
        </span>
        <span className={`status-badge ${getStatusColor(incident.status)}`}>
          {incident.status}
        </span>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerify?.();
            }}
            className="flex-1 py-2 text-sm font-medium text-success bg-success/10 rounded-lg hover:bg-success/20 transition-colors"
          >
            ✓ Confirm
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFlag?.();
            }}
            className="flex-1 py-2 text-sm font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
          >
            ⚑ Flag
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentCard;
