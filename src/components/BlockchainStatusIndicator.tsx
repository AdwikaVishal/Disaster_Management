import React, { useState, useEffect } from 'react';
import { blockchainApi } from '../services/api';
import { Shield, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';

interface BlockchainStatus {
  isConnected: boolean;
  contractAddress?: string;
  latestBlock?: string;
  networkId?: string;
  abiLoaded?: boolean;
  lastChecked: number;
  error?: string;
}

interface BlockchainStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const BlockchainStatusIndicator: React.FC<BlockchainStatusIndicatorProps> = ({
  showDetails = false,
  className = ''
}) => {
  const [status, setStatus] = useState<BlockchainStatus>({
    isConnected: false,
    lastChecked: 0
  });
  const [loading, setLoading] = useState(true);

  const checkBlockchainStatus = async () => {
    try {
      const response = await blockchainApi.getStatus();
      setStatus(response);
    } catch (error) {
      setStatus({
        isConnected: false,
        error: 'Failed to check blockchain status',
        lastChecked: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBlockchainStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkBlockchainStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (loading) return 'text-gray-400';
    return status.isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (loading) return <Clock className="w-4 h-4 animate-spin" />;
    if (status.isConnected) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    return status.isConnected ? 'Connected' : 'Disconnected';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Shield className="w-4 h-4 text-blue-500" />
        <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Status</h3>
        </div>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Contract Address</label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900 font-mono">
                {truncateAddress(status.contractAddress || '')}
              </span>
              {status.contractAddress && (
                <ExternalLink className="w-3 h-3 text-gray-400 cursor-pointer hover:text-blue-500" />
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Network ID</label>
            <p className="text-sm text-gray-900">{status.networkId || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Latest Block</label>
            <p className="text-sm text-gray-900 font-mono">{status.latestBlock || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">ABI Status</label>
            <div className="flex items-center space-x-1">
              {status.abiLoaded ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500" />
              )}
              <span className="text-sm text-gray-900">
                {status.abiLoaded ? 'Loaded' : 'Not Loaded'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Last Checked</label>
          <p className="text-sm text-gray-900">
            {status.lastChecked ? formatTimestamp(status.lastChecked) : 'Never'}
          </p>
        </div>

        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{status.error}</span>
            </div>
          </div>
        )}

        <button
          onClick={checkBlockchainStatus}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>
    </div>
  );
};

export default BlockchainStatusIndicator;