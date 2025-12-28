import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BadgeAlert, Database, Hash, Lock, Search, Download, Filter, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AuditLog {
  id: number;
  actionType: string;
  userId: string;
  userRole: string;
  targetType: string;
  targetId: string;
  targetDescription: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  errorMessage: string;
  blockchainTxHash: string;
  blockchainStatus: string;
  blockchainNetwork: string;
  blockchainGasUsed: number;
  blockchainBlockNumber: number;
  createdAt: string;
  metadata: string;
}

interface BlockchainStatus {
  status: string;
  latestBlock?: string;
  contractAddress?: string;
  rpcUrl?: string;
  abiLoaded?: boolean;
  networkId?: string;
  error?: string;
}

// Mock Blockchain Audit Data
const MOCK_LOGS: AuditLog[] = [
  { 
    id: 1, 
    actionType: 'INCIDENT_VERIFIED', 
    userId: 'admin-01', 
    userRole: 'ADMIN',
    targetType: 'INCIDENT', 
    targetId: 'INC-2938', 
    targetDescription: 'Fire incident verified in downtown area',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x7f83b1657ff1fc53b92dc18148a41363c1211111',
    blockchainStatus: 'CONFIRMED',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: 125000,
    blockchainBlockNumber: 8922103,
    createdAt: '2023-12-28T14:30:22Z',
    metadata: '{"verificationType": "AUTO_VERIFIED", "confidence": 0.95}'
  },
  { 
    id: 2, 
    actionType: 'VOLUNTEER_APPROVED', 
    userId: 'admin-01', 
    userRole: 'ADMIN',
    targetType: 'VOLUNTEER', 
    targetId: 'VOL-8821', 
    targetDescription: 'Volunteer John Doe approved for rescue operations',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x3c21ec4cf10c39d1dadc0406c9f70cf19f9a0b62',
    blockchainStatus: 'CONFIRMED',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: 95000,
    blockchainBlockNumber: 8922101,
    createdAt: '2023-12-28T14:15:10Z',
    metadata: '{"skills": ["medical", "rescue"], "experience": "2 years"}'
  },
  { 
    id: 3, 
    actionType: 'ALERT_BROADCAST', 
    userId: 'System', 
    userRole: 'SYSTEM',
    targetType: 'REGION', 
    targetId: 'REGION-4', 
    targetDescription: 'Emergency alert broadcast to Region 4 residents',
    ipAddress: '127.0.0.1',
    userAgent: 'System/Internal',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x9d44a2ef5f7e8e6d4c3b2a1f0e9d8c7b6a5f4e3d',
    blockchainStatus: 'CONFIRMED',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: 78000,
    blockchainBlockNumber: 8922098,
    createdAt: '2023-12-28T13:45:00Z',
    metadata: '{"alertType": "EVACUATION", "channels": ["SMS", "EMAIL", "APP"]}'
  },
  { 
    id: 4, 
    actionType: 'INCIDENT_REPORTED', 
    userId: 'user-4402', 
    userRole: 'USER',
    targetType: 'INCIDENT', 
    targetId: 'INC-2939', 
    targetDescription: 'Medical emergency reported near Central Hospital',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x1a99c4f7c2e8d1a6b3f9e0d5c7a8f2e4b6d9c1a3',
    blockchainStatus: 'PENDING',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: null,
    blockchainBlockNumber: null,
    createdAt: '2023-12-28T13:30:55Z',
    metadata: '{"location": "GPS", "severity": "HIGH"}'
  },
  { 
    id: 5, 
    actionType: 'RESOURCE_ASSIGNED', 
    userId: 'admin-01', 
    userRole: 'ADMIN',
    targetType: 'INCIDENT', 
    targetId: 'INC-2938', 
    targetDescription: 'Fire Brigade Unit 3 assigned to incident',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x5b661d3e4f8a2c7b1e9d0f5a3c8e1d7f4b6a9c2e5',
    blockchainStatus: 'CONFIRMED',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: 110000,
    blockchainBlockNumber: 8922095,
    createdAt: '2023-12-28T13:00:12Z',
    metadata: '{"unitType": "FIRE_BRIGADE", "eta": 8, "distance": 2.3}'
  },
  { 
    id: 6, 
    actionType: 'USER_LOGIN', 
    userId: 'admin-02', 
    userRole: 'ADMIN',
    targetType: 'AUTH', 
    targetId: 'admin-02', 
    targetDescription: 'Admin login successful',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x8e2f5d7c1a9b4e6f3d8c0a7b5e9d2f6c8a1b4e7d0',
    blockchainStatus: 'CONFIRMED',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: 65000,
    blockchainBlockNumber: 8922092,
    createdAt: '2023-12-28T12:45:30Z',
    metadata: '{"loginMethod": "OTP", "sessionId": "sess_abc123"}'
  },
  { 
    id: 7, 
    actionType: 'INCIDENT_RESOLVED', 
    userId: 'admin-01', 
    userRole: 'ADMIN',
    targetType: 'INCIDENT', 
    targetId: 'INC-2937', 
    targetDescription: 'Traffic accident cleared, road reopened',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'SUCCESS',
    errorMessage: null,
    blockchainTxHash: '0x2d8f1a6c9e4b7d0a3f5e8c1b6d9f2e5a8c1b4d7f0',
    blockchainStatus: 'CONFIRMED',
    blockchainNetwork: 'ETHEREUM',
    blockchainGasUsed: 135000,
    blockchainBlockNumber: 8922089,
    createdAt: '2023-12-28T12:20:15Z',
    metadata: '{"resolutionTime": 45, "cleanup": "completed"}'
  }
];

const MOCK_STATISTICS = {
  actionTypeCounts: {
    'INCIDENT_REPORTED': 156,
    'INCIDENT_VERIFIED': 89,
    'INCIDENT_RESOLVED': 73,
    'RESOURCE_ASSIGNED': 45,
    'USER_LOGIN': 234,
    'VOLUNTEER_APPROVED': 12,
    'ALERT_BROADCAST': 8
  },
  statusCounts: {
    'SUCCESS': 617,
    'FAILED': 3,
    'PENDING': 12
  },
  blockchainStats: {
    confirmed: 602,
    pending: 12,
    failed: 18,
    total: 632
  }
};

const MOCK_BLOCKCHAIN_STATUS: BlockchainStatus = {
  status: 'healthy',
  latestBlock: '8922103',
  contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF',
  rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
  abiLoaded: true,
  networkId: '1'
};

export default function AuditLogs() {
  const [logs] = useState<AuditLog[]>(MOCK_LOGS);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(MOCK_LOGS);
  const [statistics] = useState(MOCK_STATISTICS);
  const [blockchainStatus] = useState<BlockchainStatus>(MOCK_BLOCKCHAIN_STATUS);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    filterLogs();
  }, [searchTerm]);

  const filterLogs = () => {
    if (!searchTerm) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter(log => 
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.blockchainTxHash && log.blockchainTxHash.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLogs(filtered);
  };

  const handleExportCSV = () => {
    setExporting(true);
    // Simulate CSV export
    setTimeout(() => {
      const csvContent = "ID,Action Type,User ID,Target,Status,Blockchain TX\n" + 
        filteredLogs.map(log => `${log.id},${log.actionType},${log.userId},${log.targetId},${log.status},${log.blockchainTxHash}`).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setExporting(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxHash = (txHash: string) => {
    if (!txHash) return 'N/A';
    return `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;
  };

  const handleRefresh = () => {
    // Simulate refresh by resetting search
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
            <div className={`px-2 py-0.5 rounded text-xs font-mono border ${
              blockchainStatus?.status === 'healthy' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
            }`}>
              {blockchainStatus?.status === 'healthy' ? 'BLOCKCHAIN ENABLED' : 'BLOCKCHAIN DISCONNECTED'}
            </div>
          </div>
          <p className="text-muted-foreground">Immutable record of all critical system actions with real-time blockchain verification.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.actionTypeCounts['INCIDENT_REPORTED'] || 0}</div>
              <p className="text-xs text-muted-foreground">Incidents Reported</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.actionTypeCounts['INCIDENT_VERIFIED'] || 0}</div>
              <p className="text-xs text-muted-foreground">Incidents Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.blockchainStats.confirmed || 0}</div>
              <p className="text-xs text-muted-foreground">Blockchain Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.blockchainStats.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Pending Blockchain</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blockchain Status */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {blockchainStatus?.status === 'healthy' ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            Blockchain Network Status
          </CardTitle>
          <CardDescription>
            Real-time blockchain connectivity and transaction status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                blockchainStatus?.status === 'healthy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {blockchainStatus?.status || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium">Latest Block:</span>
              <span className="ml-2 font-mono">#{blockchainStatus?.latestBlock || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">Network ID:</span>
              <span className="ml-2">{blockchainStatus?.networkId || 'N/A'}</span>
            </div>
          </div>
          {blockchainStatus?.error && (
            <div className="mt-2 text-sm text-red-600">
              Error: {blockchainStatus.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Audit Log Entries
          </CardTitle>
          <CardDescription>
            {filteredLogs.length} of {logs.length} entries displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-left">Action Type</th>
                  <th className="px-4 py-3 text-left">User ID</th>
                  <th className="px-4 py-3 text-left">Target</th>
                  <th className="px-4 py-3 text-left">Blockchain TX</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{log.userId}</div>
                        <div className="text-xs text-muted-foreground">{log.userRole}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-xs">{log.targetType}: {log.targetId}</div>
                        {log.targetDescription && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {log.targetDescription}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {log.blockchainTxHash ? (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400">
                            {formatTxHash(log.blockchainTxHash)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not logged</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {log.status === 'SUCCESS' && <Lock className="w-3 h-3" />}
                          {log.status}
                        </span>
                        {log.blockchainStatus && (
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusColor(log.blockchainStatus)}`}>
                            {log.blockchainStatus}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
