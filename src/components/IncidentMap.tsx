import React from 'react';
import { Incident } from '../types';
import { getTypeIcon, getSeverityColor } from '../utils/helpers';

interface IncidentMapProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  onIncidentClick,
  className = '',
}) => {
  // This is a placeholder map visualization
  // In production, integrate with Mapbox or Google Maps
  return (
    <div
      className={`relative bg-gradient-to-br from-calm-blue to-muted rounded-xl overflow-hidden ${className}`}
    >
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary/20"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Center marker (user location) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="w-4 h-4 bg-primary rounded-full shadow-glow animate-pulse" />
          <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping" />
        </div>
      </div>

      {/* Incident markers */}
      {incidents.slice(0, 6).map((incident, index) => {
        // Position markers in a circle around center
        const angle = (index / 6) * 2 * Math.PI;
        const radius = 30 + Math.random() * 20;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;

        return (
          <button
            key={incident.id}
            onClick={() => onIncidentClick?.(incident)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                incident.severity === 'Critical' || incident.severity === 'High'
                  ? 'bg-destructive'
                  : incident.severity === 'Medium'
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
            >
              <span className="text-lg">{getTypeIcon(incident.type)}</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit rotate-45" />
          </button>
        );
      })}

      {/* Map label */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium">
        📍 Live Incident Map
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentMap;
