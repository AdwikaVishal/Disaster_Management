import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Incident, IncidentType, SeverityLevel } from '../types';
import { mockIncidents } from '../data/mockData';
import { generateId, calculatePriority } from '../utils/helpers';

interface IncidentContextType {
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'priorityScore'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  verifyIncident: (id: string) => void;
  flagIncident: (id: string) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  const addIncident = (incidentData: Omit<Incident, 'id' | 'timestamp' | 'priorityScore'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: generateId(),
      timestamp: new Date().toISOString(),
      priorityScore: 0,
    };
    newIncident.priorityScore = calculatePriority(newIncident);
    
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated = { ...inc, ...updates };
          updated.priorityScore = calculatePriority(updated);
          return updated;
        }
        return inc;
      })
    );
  };

  const verifyIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated = { ...inc, verifications: inc.verifications + 1 };
          if (updated.verifications >= 3 && updated.status === 'Pending') {
            updated.status = 'Verified';
          }
          updated.priorityScore = calculatePriority(updated);
          return updated;
        }
        return inc;
      })
    );
  };

  const flagIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, flags: inc.flags + 1 } : inc))
    );
  };

  return (
    <IncidentContext.Provider
      value={{ incidents, addIncident, updateIncident, verifyIncident, flagIncident }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = (): IncidentContextType => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
