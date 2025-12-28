import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { incidentApi } from '../services/api';
import { toast } from 'sonner';

interface MLStatus {
  mlServiceAvailable: boolean;
  status: string;
  fallbackMode: boolean;
  timestamp: string;
}

interface MLStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

const MLStatusIndicator: React.FC<MLStatusIndicatorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [mlStatus, setMLStatus] = useState<MLStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    checkMLHealth();
    
    // Check ML health every 30 seconds
    const interval = setInterval(checkMLHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkMLHealth = async () => {
    try {
      setLoading(true);
      const response = await incidentApi.getMLHealth();
      
      if (response.success) {
        setMLStatus({
          mlServiceAvailable: response.mlServiceAvailable,
          status: response.status,
          fallbackMode: response.fallbackMode,
          timestamp: response.timestamp,
        });
      }
    } catch (error) {
      console.error('Failed to check ML health:', error);
      setMLStatus({
        mlServiceAvailable: false,
        status: 'error',
        fallbackMode: true,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  const handleRefresh = () => {
    checkMLHealth();
    toast.info('Refreshing ML service status...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unavailable': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'unavailable': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (!showDetails) {
    // Compact indicator for header/navbar
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">ML</span>
        </div>
        
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
        ) : (
          <Badge className={`text-xs ${mlStatus ? getStatusColor(mlStatus.status) : 'text-gray-600 bg-gray-100'}`}>
            {mlStatus?.mlServiceAvailable ? 'Active' : 'Fallback'}
          </Badge>
        )}
      </div>
    );
  }

  // Detailed card view
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">ML Service Status</CardTitle>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <CardDescription>
          Machine Learning service health and performance monitoring
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {mlStatus ? getStatusIcon(mlStatus.status) : <Activity className="w-4 h-4" />}
              <span className="text-sm font-medium">Service Status</span>
            </div>
            <Badge className={mlStatus ? getStatusColor(mlStatus.status) : 'text-gray-600 bg-gray-100'}>
              {mlStatus?.status || 'Unknown'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Mode</span>
            </div>
            <Badge className={mlStatus?.fallbackMode ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100'}>
              {mlStatus?.fallbackMode ? 'Fallback' : 'ML Active'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <Badge className="text-blue-600 bg-blue-100">
              {mlStatus?.mlServiceAvailable ? 'Optimal' : 'Degraded'}
            </Badge>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Health Check:</span>
            <span className="font-medium">{lastChecked.toLocaleTimeString()}</span>
          </div>
          
          {mlStatus?.timestamp && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Service Timestamp:</span>
              <span className="font-medium">
                {new Date(mlStatus.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {mlStatus && (
          <div className={`p-3 rounded-lg border ${
            mlStatus.mlServiceAvailable 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              {mlStatus.mlServiceAvailable ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  mlStatus.mlServiceAvailable ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {mlStatus.mlServiceAvailable 
                    ? 'ML Service Online' 
                    : 'Running in Fallback Mode'
                  }
                </p>
                <p className={`text-xs mt-1 ${
                  mlStatus.mlServiceAvailable ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {mlStatus.mlServiceAvailable
                    ? 'All ML models are operational. Fraud detection, risk assessment, and similarity analysis are fully functional.'
                    : 'ML service is unavailable. Using rule-based fallback algorithms for incident analysis.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ML Features Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">ML Features</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { name: 'Fraud Detection', available: mlStatus?.mlServiceAvailable },
              { name: 'Risk Assessment', available: mlStatus?.mlServiceAvailable },
              { name: 'Similarity Analysis', available: mlStatus?.mlServiceAvailable },
              { name: 'Severity Suggestions', available: true }, // Always available with fallback
              { name: 'Emergency Recommendations', available: true }, // Always available with fallback
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{feature.name}</span>
                <div className="flex items-center gap-1">
                  {feature.available ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 text-xs">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-yellow-600" />
                      <span className="text-yellow-600 text-xs">Fallback</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLStatusIndicator;