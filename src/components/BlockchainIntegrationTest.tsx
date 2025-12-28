import React, { useState } from 'react';
import { blockchainApi } from '../services/api';
import { Shield, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const BlockchainIntegrationTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests: TestResult[] = [
      { test: 'Health Check', status: 'pending' },
      { test: 'Verify Incident', status: 'pending' },
      { test: 'Assign Resource', status: 'pending' },
      { test: 'Resolve Incident', status: 'pending' },
      { test: 'Get Audit Trail', status: 'pending' },
    ];
    
    setResults([...tests]);

    try {
      // Test 1: Health Check
      const healthResult = await blockchainApi.healthCheck();
      tests[0] = {
        test: 'Health Check',
        status: healthResult.status === 'healthy' ? 'success' : 'error',
        message: healthResult.status === 'healthy' ? 'Blockchain service is healthy' : healthResult.error,
        data: healthResult
      };
      setResults([...tests]);

      // Test 2: Verify Incident
      const verifyResult = await blockchainApi.verifyIncident(1);
      tests[1] = {
        test: 'Verify Incident',
        status: verifyResult.success ? 'success' : 'error',
        message: verifyResult.success ? `TX: ${verifyResult.transactionHash}` : verifyResult.error,
        data: verifyResult
      };
      setResults([...tests]);

      // Test 3: Assign Resource
      const assignResult = await blockchainApi.assignResource(1, 'TEST_RESOURCE_001');
      tests[2] = {
        test: 'Assign Resource',
        status: assignResult.success ? 'success' : 'error',
        message: assignResult.success ? `TX: ${assignResult.transactionHash}` : assignResult.error,
        data: assignResult
      };
      setResults([...tests]);

      // Test 4: Resolve Incident
      const resolveResult = await blockchainApi.resolveIncident(1);
      tests[3] = {
        test: 'Resolve Incident',
        status: resolveResult.success ? 'success' : 'error',
        message: resolveResult.success ? `TX: ${resolveResult.transactionHash}` : resolveResult.error,
        data: resolveResult
      };
      setResults([...tests]);

      // Test 5: Get Audit Trail
      const auditResult = await blockchainApi.getAuditTrail(1);
      tests[4] = {
        test: 'Get Audit Trail',
        status: auditResult.success ? 'success' : 'error',
        message: auditResult.success ? `Found ${auditResult.auditTrail?.length || 0} events` : auditResult.error,
        data: auditResult
      };
      setResults([...tests]);

      const successCount = tests.filter(t => t.status === 'success').length;
      toast.success(`Blockchain tests completed: ${successCount}/${tests.length} passed`);

    } catch (error) {
      toast.error('Blockchain integration test failed');
      console.error('Test error:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Integration Test</h3>
        </div>
        <button
          onClick={runTests}
          disabled={testing}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{testing ? 'Running Tests...' : 'Run Tests'}</span>
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <span className="font-medium text-gray-900">{result.test}</span>
              </div>
              
              <div className={`text-sm ${getStatusColor(result.status)}`}>
                {result.message || 'Waiting...'}
              </div>
            </div>
          ))}
          
          {!testing && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Tests completed. Check console for detailed results.
              </div>
            </div>
          )}
        </div>
      )}

      {results.length === 0 && !testing && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>Click "Run Tests" to test blockchain integration</p>
          <p className="text-sm mt-1">This will test all blockchain endpoints and smart contract functions</p>
        </div>
      )}
    </div>
  );
};

export default BlockchainIntegrationTest;