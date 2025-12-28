import React, { useState, useEffect } from 'react';
import { blockchainApi } from '../services/api';
import { Shield, Clock, CheckCircle, Users, AlertTriangle, ExternalLink } from 'lucide-react';

interface AuditEvent {
  event: string;
  incidentId: number;
  admin?: string;
  resourceId?: string;
  timestamp: number;
  txHash: string;
  blockNumber?: number;
}

interface BlockchainAuditTrailProps {
  incidentId: number;
  className?: string;
}

export const BlockchainAuditTrail: React.FC<BlockchainAuditTrailProps> = ({
  incidentId,
  className = ''
}) => {
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditTrail();
  }, [incidentId]);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await blockchainApi.getAuditTrail(incidentId);
      
      if (response.success) {
        setAuditTrail(response.auditTrail || []);
      } else {
        setError(response.error || 'Failed to fetch audit trail');
      }
    } catch (err) {
      setError('Network error while fetching audit trail');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'IncidentVerified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ResourceAssigned':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'IncidentResolved':
        return <AlertTriangle className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'IncidentVerified':
        return 'border-green-200 bg-green-50';
      case 'ResourceAssigned':
        return 'border-blue-200 bg-blue-50';
      case 'IncidentResolved':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEventDescription = (event: AuditEvent) => {
    switch (event.event) {
      case 'IncidentVerified':
        return `Incident #${event.incidentId} was verified by admin ${truncateAddress(event.admin || '')}`;
      case 'ResourceAssigned':
        return `Resource "${event.resourceId}" was assigned to incident #${event.incidentId}`;
      case 'IncidentResolved':
        return `Incident #${event.incidentId} was marked as resolved`;
      default:
        return `Unknown event: ${event.event}`;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Audit Trail</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Clock className="w-6 h-6 text-gray-400 animate-spin mr-2" />
          <span className="text-gray-500">Loading audit trail...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Audit Trail</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchAuditTrail}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Audit Trail</h3>
        </div>
        <button
          onClick={fetchAuditTrail}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {auditTrail.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No blockchain events found for this incident</p>
          <p className="text-sm text-gray-400 mt-1">
            Events will appear here once the incident is processed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditTrail.map((event, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getEventColor(event.event)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.event)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {event.event.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {getEventDescription(event)}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-gray-500">Transaction Hash:</span>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="font-mono text-gray-900">
                          {truncateHash(event.txHash)}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 cursor-pointer hover:text-blue-500" />
                      </div>
                    </div>
                    
                    {event.blockNumber && (
                      <div>
                        <span className="font-medium text-gray-500">Block Number:</span>
                        <p className="font-mono text-gray-900 mt-1">
                          {event.blockNumber.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total Events: {auditTrail.length}</span>
          <span>Incident ID: #{incidentId}</span>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAuditTrail;