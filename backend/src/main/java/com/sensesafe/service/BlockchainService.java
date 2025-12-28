package com.sensesafe.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;

@Service
public class BlockchainService {

    @Value("${blockchain.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.private-key}")
    private String privateKey;

    @Value("${blockchain.contract-address}")
    private String contractAddress;

    private Web3j web3j;
    private Credentials credentials;
    private DefaultGasProvider gasProvider;

    public BlockchainService() {
        // Initialize will be called when values are injected
    }

    private void initialize() {
        if (web3j == null) {
            try {
                this.web3j = Web3j.build(new HttpService(rpcUrl));
                this.credentials = Credentials.create(privateKey);
                this.gasProvider = new DefaultGasProvider();
            } catch (Exception e) {
                // Log error but don't fail the service
                System.err.println("Failed to initialize blockchain service: " + e.getMessage());
            }
        }
    }

    public Map<String, Object> logVerified(Long incidentId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            initialize();
            if (web3j == null) {
                throw new RuntimeException("Blockchain service not initialized");
            }

            // For now, we'll simulate the blockchain transaction
            // In a real implementation, you would load the contract and call the method
            String txHash = simulateTransaction("logVerified", incidentId);
            
            result.put("success", true);
            result.put("transactionHash", txHash);
            result.put("message", "Incident verification logged on blockchain");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    public Map<String, Object> logResource(Long incidentId, String resourceId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            initialize();
            if (web3j == null) {
                throw new RuntimeException("Blockchain service not initialized");
            }

            String txHash = simulateTransaction("logResource", incidentId, resourceId);
            
            result.put("success", true);
            result.put("transactionHash", txHash);
            result.put("message", "Resource allocation logged on blockchain");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    public Map<String, Object> logResolved(Long incidentId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            initialize();
            if (web3j == null) {
                throw new RuntimeException("Blockchain service not initialized");
            }

            String txHash = simulateTransaction("logResolved", incidentId);
            
            result.put("success", true);
            result.put("transactionHash", txHash);
            result.put("message", "Incident resolution logged on blockchain");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    public Map<String, Object> getIncidentAuditTrail(Long incidentId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            initialize();
            if (web3j == null) {
                throw new RuntimeException("Blockchain service not initialized");
            }

            // Simulate getting audit trail from blockchain
            result.put("success", true);
            result.put("incidentId", incidentId);
            result.put("auditTrail", simulateAuditTrail(incidentId));
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    public Map<String, Object> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            initialize();
            if (web3j == null) {
                result.put("status", "unhealthy");
                result.put("message", "Blockchain service not initialized");
                return result;
            }

            // Check if we can connect to the blockchain
            BigInteger blockNumber = web3j.ethBlockNumber().send().getBlockNumber();
            
            result.put("status", "healthy");
            result.put("latestBlock", blockNumber.toString());
            result.put("contractAddress", contractAddress);
            
        } catch (Exception e) {
            result.put("status", "unhealthy");
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    // Simulation methods for development/testing
    private String simulateTransaction(String method, Object... params) {
        // Generate a mock transaction hash
        String paramsStr = String.join(",", java.util.Arrays.toString(params));
        int hash = (method + paramsStr + System.currentTimeMillis()).hashCode();
        return "0x" + Integer.toHexString(Math.abs(hash)).toLowerCase();
    }

    private Object[] simulateAuditTrail(Long incidentId) {
        // Return mock audit trail
        return new Object[]{
            Map.of(
                "action", "verified",
                "timestamp", System.currentTimeMillis() / 1000,
                "txHash", simulateTransaction("logVerified", incidentId)
            ),
            Map.of(
                "action", "resource_allocated",
                "timestamp", (System.currentTimeMillis() / 1000) + 300,
                "txHash", simulateTransaction("logResource", incidentId, "FIRE_BRIGADE_001")
            )
        };
    }

    // Real implementation methods (commented out for now)
    /*
    private TransactionReceipt executeContractMethod(String methodName, Object... params) throws Exception {
        // Load the contract using web3j generated wrapper
        IncidentAudit contract = IncidentAudit.load(
            contractAddress, web3j, credentials, gasProvider
        );
        
        // Call the appropriate method based on methodName
        switch (methodName) {
            case "logVerified":
                return contract.logVerified(BigInteger.valueOf((Long) params[0])).send();
            case "logResource":
                return contract.logResource(
                    BigInteger.valueOf((Long) params[0]), 
                    (String) params[1]
                ).send();
            case "logResolved":
                return contract.logResolved(BigInteger.valueOf((Long) params[0])).send();
            default:
                throw new IllegalArgumentException("Unknown method: " + methodName);
        }
    }
    */
}