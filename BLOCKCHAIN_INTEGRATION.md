# Blockchain Integration Documentation

## Overview

The SenseSafe platform now includes comprehensive blockchain integration for incident audit trails and transparency. This integration uses Ethereum smart contracts to create immutable records of incident lifecycle events.

## Smart Contract Interface

The system uses the `IncidentAudit.abi` smart contract with the following functions:

### Functions
- `logVerified(uint256 incidentId)` - Log incident verification by admin
- `logResource(uint256 incidentId, string resourceId)` - Log resource assignment
- `logResolved(uint256 incidentId)` - Log incident resolution

### Events
- `IncidentVerified(uint256 incidentId, address admin, uint256 timestamp)`
- `ResourceAssigned(uint256 incidentId, string resourceId, address admin, uint256 timestamp)`
- `IncidentResolved(uint256 incidentId, address admin, uint256 timestamp)`

## Backend Integration

### BlockchainService
Located at: `backend/src/main/java/com/sensesafe/service/BlockchainService.java`

**Key Features:**
- Loads smart contract ABI from `IncidentAudit.abi`
- Web3j integration for Ethereum blockchain interaction
- Fallback simulation mode for development
- Health monitoring and status checks
- Async blockchain logging to prevent blocking

**Configuration:**
```yaml
blockchain:
  rpc-url: https://eth-mainnet.g.alchemy.com/v2/your-api-key
  private-key: your-private-key
  contract-address: 0x598761b8e308aa6f37Cd57B468CB8c86eB519F4b
```

### IncidentService Integration
The `IncidentService` automatically logs blockchain events during incident lifecycle:

1. **Incident Verification** → `logVerified()` called
2. **Resource Assignment** → `logResource()` called  
3. **Incident Resolution** → `logResolved()` called

All blockchain calls are wrapped in try-catch blocks to prevent service failures.

### API Endpoints
Base URL: `/api/blockchain`

- `POST /verify` - Verify incident on blockchain
- `POST /assign` - Log resource assignment
- `POST /resolve` - Log incident resolution
- `GET /audit/{incidentId}` - Get audit trail
- `GET /health` - Blockchain service health check
- `GET /status` - Blockchain connection status

## Frontend Integration

### Components

#### BlockchainStatusIndicator
- Real-time blockchain connection status
- Contract address and network information
- ABI loading status
- Compact and detailed view modes

#### BlockchainAuditTrail
- Display incident audit trail from blockchain
- Event timeline with transaction hashes
- Block numbers and timestamps
- Admin addresses and resource IDs

#### BlockchainIntegrationTest
- Comprehensive blockchain testing interface
- Tests all smart contract functions
- Health check validation
- Transaction hash verification

### API Integration
Located at: `src/services/api.ts`

```typescript
export const blockchainApi = {
  verifyIncident: async (incidentId: number): Promise<ApiResponse>
  assignResource: async (incidentId: number, resourceId: string): Promise<ApiResponse>
  resolveIncident: async (incidentId: number): Promise<ApiResponse>
  getAuditTrail: async (incidentId: number): Promise<ApiResponse>
  healthCheck: async (): Promise<ApiResponse>
  getStatus: async (): Promise<ApiResponse>
}
```

### Dashboard Integration
The Admin Analytics Dashboard includes a "System Status" tab with:
- Blockchain connection status
- Integration testing interface
- Sample audit trail display
- Real-time blockchain metrics

## Development vs Production

### Development Mode
- Uses simulation for blockchain transactions
- Generates mock transaction hashes
- Provides realistic audit trail data
- No actual blockchain interaction required

### Production Mode
- Connects to real Ethereum network
- Executes actual smart contract transactions
- Requires valid RPC URL and private key
- Gas fees apply for transactions

## Security Considerations

1. **Private Key Management**
   - Store private keys securely (environment variables)
   - Use dedicated admin wallet for incident logging
   - Implement key rotation policies

2. **Access Control**
   - Only admin users can trigger blockchain transactions
   - API endpoints protected with JWT authentication
   - Role-based access control (RBAC)

3. **Error Handling**
   - Graceful fallback when blockchain unavailable
   - Transaction failure doesn't block incident processing
   - Comprehensive logging for audit purposes

## Testing

### Integration Tests
Use the `BlockchainIntegrationTest` component to verify:
- Blockchain service connectivity
- Smart contract function calls
- Transaction hash generation
- Audit trail retrieval
- Error handling

### Manual Testing
1. Navigate to Admin Dashboard → System Status tab
2. Click "Run Tests" in Blockchain Integration Test
3. Verify all tests pass successfully
4. Check audit trail display for sample incident

## Monitoring

### Health Checks
- Blockchain service status endpoint
- Network connectivity monitoring
- Contract address validation
- ABI loading verification

### Metrics
- Transaction success/failure rates
- Average transaction confirmation time
- Gas usage statistics
- Audit trail completeness

## Troubleshooting

### Common Issues

1. **Blockchain Service Not Initialized**
   - Check RPC URL configuration
   - Verify private key format
   - Ensure contract address is valid

2. **Transaction Failures**
   - Check network connectivity
   - Verify gas price settings
   - Confirm wallet balance

3. **ABI Loading Errors**
   - Verify `IncidentAudit.abi` file exists
   - Check file format and syntax
   - Ensure proper classpath configuration

### Debug Mode
Enable debug logging in `application.yml`:
```yaml
logging:
  level:
    com.sensesafe.service.BlockchainService: DEBUG
```

## Future Enhancements

1. **Multi-Chain Support**
   - Support for multiple blockchain networks
   - Cross-chain audit trail synchronization

2. **Advanced Analytics**
   - Blockchain transaction analytics
   - Gas optimization strategies
   - Performance metrics dashboard

3. **Smart Contract Upgrades**
   - Proxy contract pattern implementation
   - Automated contract deployment
   - Version management system

## Conclusion

The blockchain integration provides transparent, immutable audit trails for all incident management activities. The system is designed to be resilient, with fallback mechanisms ensuring continued operation even when blockchain services are unavailable.

For technical support or questions, refer to the development team or check the system logs for detailed error information.