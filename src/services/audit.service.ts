import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/audit`;

export interface AuditLog {
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

export interface AuditLogFilters {
  actionType?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AuditStatistics {
  actionTypeCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  blockchainStats: {
    confirmed: number;
    pending: number;
    failed: number;
    total: number;
  };
}

class AuditService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLog[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();

    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await axios.get(`${API_BASE_URL}/logs?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    return {
      logs: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.number,
    };
  }

  /**
   * Get incident audit trail
   */
  async getIncidentAuditTrail(incidentId: string): Promise<AuditLog[]> {
    const response = await axios.get(`${API_BASE_URL}/incident/${incidentId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get audit logs by user
   */
  async getAuditLogsByUser(userId: string, page = 0, size = 20): Promise<{
    logs: AuditLog[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
    });

    return {
      logs: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
    };
  }

  /**
   * Get audit logs by action type
   */
  async getAuditLogsByActionType(actionType: string, page = 0, size = 20): Promise<{
    logs: AuditLog[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/action/${actionType}?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
    });

    return {
      logs: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
    };
  }

  /**
   * Get recent audit logs
   */
  async getRecentLogs(limit = 50): Promise<AuditLog[]> {
    const response = await axios.get(`${API_BASE_URL}/recent?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(): Promise<AuditStatistics> {
    const response = await axios.get(`${API_BASE_URL}/statistics`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get pending blockchain logs
   */
  async getPendingBlockchainLogs(): Promise<AuditLog[]> {
    const response = await axios.get(`${API_BASE_URL}/pending-blockchain`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await axios.get(`${API_BASE_URL}/logs/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Find audit log by blockchain hash
   */
  async getAuditLogByBlockchainHash(txHash: string): Promise<AuditLog> {
    const response = await axios.get(`${API_BASE_URL}/blockchain/${txHash}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    const params = new URLSearchParams();

    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`${API_BASE_URL}/export?${params.toString()}`, {
      headers: this.getHeaders(),
      responseType: 'text',
    });

    return response.data;
  }

  /**
   * Download CSV file
   */
  async downloadCsv(filters: AuditLogFilters = {}): Promise<void> {
    const csvContent = await this.exportAuditLogs(filters);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get blockchain status
   */
  async getBlockchainStatus(): Promise<{
    status: string;
    latestBlock?: string;
    contractAddress?: string;
    rpcUrl?: string;
    abiLoaded?: boolean;
    networkId?: string;
    error?: string;
  }> {
    const response = await axios.get(`${API_BASE_URL}/blockchain/status`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get blockchain audit trail for an incident
   */
  async getBlockchainAuditTrail(incidentId: number): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/blockchain/audit/${incidentId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get all action types
   */
  async getActionTypes(): Promise<string[]> {
    const response = await axios.get(`${API_BASE_URL}/action-types`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get all user roles
   */
  async getUserRoles(): Promise<string[]> {
    const response = await axios.get(`${API_BASE_URL}/user-roles`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Format transaction hash for display
   */
  formatTransactionHash(txHash: string): string {
    if (!txHash) return '';
    if (txHash.length <= 10) return txHash;
    return `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  /**
   * Get blockchain status color
   */
  getBlockchainStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }
}

export default new AuditService();
