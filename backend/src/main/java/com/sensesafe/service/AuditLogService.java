package com.sensesafe.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sensesafe.model.AuditLog;
import com.sensesafe.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    @Qualifier("blockchainService")
    private BlockchainService blockchainService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Log an action with blockchain integration
     */
    public CompletableFuture<AuditLog> logAction(String actionType, String userId, String userRole,
                                                String targetType, String targetId, String targetDescription,
                                                String ipAddress, String userAgent, String status, String errorMessage) {
        
        return CompletableFuture.supplyAsync(() -> {
            AuditLog auditLog = new AuditLog(actionType, userId, userRole, status);
            auditLog.setTargetType(targetType);
            auditLog.setTargetId(targetId);
            auditLog.setTargetDescription(targetDescription);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLog.setErrorMessage(errorMessage);
            auditLog.setBlockchainStatus("PENDING");
            
            // Save to database first
            AuditLog savedLog = auditLogRepository.save(auditLog);
            
            // Log to blockchain asynchronously
            CompletableFuture.runAsync(() -> {
                try {
                    logToBlockchain(savedLog);
                } catch (Exception e) {
                    System.err.println("Failed to log to blockchain: " + e.getMessage());
                    // Update status to failed but don't fail the main operation
                    savedLog.setBlockchainStatus("FAILED");
                    savedLog.setErrorMessage("Blockchain logging failed: " + e.getMessage());
                    auditLogRepository.save(savedLog);
                }
            });
            
            return savedLog;
        });
    }

    /**
     * Log an action with metadata
     */
    public CompletableFuture<AuditLog> logActionWithMetadata(String actionType, String userId, String userRole,
                                                            String targetType, String targetId, String targetDescription,
                                                            String ipAddress, String userAgent, String status, 
                                                            String errorMessage, Map<String, Object> metadata) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                AuditLog auditLog = new AuditLog(actionType, userId, userRole, status);
                auditLog.setTargetType(targetType);
                auditLog.setTargetId(targetId);
                auditLog.setTargetDescription(targetDescription);
                auditLog.setIpAddress(ipAddress);
                auditLog.setUserAgent(userAgent);
                auditLog.setErrorMessage(errorMessage);
                auditLog.setBlockchainStatus("PENDING");
                
                // Convert metadata to JSON string
                if (metadata != null && !metadata.isEmpty()) {
                    auditLog.setMetadata(objectMapper.writeValueAsString(metadata));
                }
                
                AuditLog savedLog = auditLogRepository.save(auditLog);
                
                // Log to blockchain asynchronously
                CompletableFuture.runAsync(() -> {
                    try {
                        logToBlockchain(savedLog);
                    } catch (Exception e) {
                        System.err.println("Failed to log to blockchain: " + e.getMessage());
                        savedLog.setBlockchainStatus("FAILED");
                        savedLog.setErrorMessage("Blockchain logging failed: " + e.getMessage());
                        auditLogRepository.save(savedLog);
                    }
                });
                
                return savedLog;
            } catch (Exception e) {
                throw new RuntimeException("Failed to log action: " + e.getMessage(), e);
            }
        });
    }

    /**
     * Get audit logs with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(String actionType, String userId, String status,
                                     LocalDateTime startDate, LocalDateTime endDate,
                                     Pageable pageable) {
        
        if (actionType != null || userId != null || status != null || startDate != null || endDate != null) {
            return auditLogRepository.findByMultipleCriteria(actionType, userId, status, startDate, endDate, pageable);
        } else {
            return auditLogRepository.findAll(pageable);
        }
    }

    /**
     * Get audit trail for a specific incident
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getIncidentAuditTrail(String incidentId) {
        return auditLogRepository.getIncidentAuditTrail(incidentId);
    }

    /**
     * Get audit logs by user ID
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByUser(String userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get audit logs by action type
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByActionType(String actionType, Pageable pageable) {
        return auditLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType, pageable);
    }

    /**
     * Get recent audit logs
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findRecentLogs(pageable);
    }

    /**
     * Get audit statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAuditStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get counts by action type
        List<Object[]> actionCounts = auditLogRepository.countByActionType();
        Map<String, Long> actionTypeStats = new HashMap<>();
        for (Object[] row : actionCounts) {
            actionTypeStats.put((String) row[0], (Long) row[1]);
        }
        stats.put("actionTypeCounts", actionTypeStats);
        
        // Get counts by status
        List<Object[]> statusCounts = auditLogRepository.countByStatus();
        Map<String, Long> statusStats = new HashMap<>();
        for (Object[] row : statusCounts) {
            statusStats.put((String) row[0], (Long) row[1]);
        }
        stats.put("statusCounts", statusStats);
        
        // Get blockchain statistics
        List<Object[]> blockchainStats = auditLogRepository.getBlockchainStatistics();
        if (!blockchainStats.isEmpty()) {
            Object[] statsRow = blockchainStats.get(0);
            Map<String, Object> blockchainMap = new HashMap<>();
            blockchainMap.put("confirmed", statsRow[0]);
            blockchainMap.put("pending", statsRow[1]);
            blockchainMap.put("failed", statsRow[2]);
            blockchainMap.put("total", statsRow[3]);
            stats.put("blockchainStats", blockchainMap);
        }
        
        return stats;
    }

    /**
     * Get pending blockchain logs
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getPendingBlockchainLogs() {
        return auditLogRepository.findPendingBlockchainLogs();
    }

    /**
     * Find audit log by ID
     */
    @Transactional(readOnly = true)
    public Optional<AuditLog> getAuditLogById(Long id) {
        return auditLogRepository.findById(id);
    }

    /**
     * Find audit log by blockchain transaction hash
     */
    @Transactional(readOnly = true)
    public Optional<AuditLog> getAuditLogByBlockchainHash(String blockchainTxHash) {
        return auditLogRepository.findByBlockchainTxHash(blockchainTxHash);
    }

    /**
     * Update blockchain status for an audit log
     */
    public void updateBlockchainStatus(Long auditLogId, String txHash, String status, 
                                     Long gasUsed, Long blockNumber) {
        Optional<AuditLog> auditLogOpt = auditLogRepository.findById(auditLogId);
        if (auditLogOpt.isPresent()) {
            AuditLog auditLog = auditLogOpt.get();
            auditLog.setBlockchainTxHash(txHash);
            auditLog.setBlockchainStatus(status);
            auditLog.setBlockchainGasUsed(gasUsed);
            auditLog.setBlockchainBlockNumber(blockNumber);
            auditLogRepository.save(auditLog);
        }
    }

    /**
     * Export audit logs to CSV format
     */
    public String exportAuditLogsToCSV(String actionType, String userId, String status,
                                     LocalDateTime startDate, LocalDateTime endDate) {
        // Get all matching logs (without pagination for export)
        Pageable pageable = PageRequest.of(0, 10000, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> auditLogs = getAuditLogs(actionType, userId, status, startDate, endDate, pageable);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Action Type,User ID,User Role,Target Type,Target ID,Target Description,");
        csv.append("IP Address,User Agent,Status,Error Message,Blockchain TX Hash,Blockchain Status,");
        csv.append("Blockchain Network,Gas Used,Block Number,Created At,Metadata\n");
        
        for (AuditLog log : auditLogs.getContent()) {
            csv.append(escapeCsvField(log.getId().toString())).append(",");
            csv.append(escapeCsvField(log.getActionType())).append(",");
            csv.append(escapeCsvField(log.getUserId())).append(",");
            csv.append(escapeCsvField(log.getUserRole() != null ? log.getUserRole() : "")).append(",");
            csv.append(escapeCsvField(log.getTargetType() != null ? log.getTargetType() : "")).append(",");
            csv.append(escapeCsvField(log.getTargetId() != null ? log.getTargetId() : "")).append(",");
            csv.append(escapeCsvField(log.getTargetDescription() != null ? log.getTargetDescription() : "")).append(",");
            csv.append(escapeCsvField(log.getIpAddress() != null ? log.getIpAddress() : "")).append(",");
            csv.append(escapeCsvField(log.getUserAgent() != null ? log.getUserAgent() : "")).append(",");
            csv.append(escapeCsvField(log.getStatus())).append(",");
            csv.append(escapeCsvField(log.getErrorMessage() != null ? log.getErrorMessage() : "")).append(",");
            csv.append(escapeCsvField(log.getBlockchainTxHash() != null ? log.getBlockchainTxHash() : "")).append(",");
            csv.append(escapeCsvField(log.getBlockchainStatus() != null ? log.getBlockchainStatus() : "")).append(",");
            csv.append(escapeCsvField(log.getBlockchainNetwork() != null ? log.getBlockchainNetwork() : "")).append(",");
            csv.append(log.getBlockchainGasUsed() != null ? log.getBlockchainGasUsed() : "").append(",");
            csv.append(log.getBlockchainBlockNumber() != null ? log.getBlockchainBlockNumber() : "").append(",");
            csv.append(log.getCreatedAt() != null ? log.getCreatedAt().toString() : "").append(",");
            csv.append(escapeCsvField(log.getMetadata() != null ? log.getMetadata() : "")).append("\n");
        }
        
        return csv.toString();
    }

    /**
     * Log to blockchain
     */
    private void logToBlockchain(AuditLog auditLog) throws Exception {
        Map<String, Object> blockchainResult;
        
        // Choose appropriate blockchain method based on action type
        switch (auditLog.getActionType()) {
            case "INCIDENT_VERIFIED":
                Long incidentId = Long.valueOf(auditLog.getTargetId());
                blockchainResult = blockchainService.logVerified(incidentId);
                break;
            case "RESOURCE_ASSIGNED":
                incidentId = Long.valueOf(auditLog.getTargetId());
                blockchainResult = blockchainService.logResource(incidentId, auditLog.getTargetDescription());
                break;
            case "INCIDENT_RESOLVED":
                incidentId = Long.valueOf(auditLog.getTargetId());
                blockchainResult = blockchainService.logResolved(incidentId);
                break;
            default:
                // For other actions, create a generic audit log on blockchain
                blockchainResult = blockchainService.logGenericAudit(auditLog);
                break;
        }
        
        if (blockchainResult != null && Boolean.TRUE.equals(blockchainResult.get("success"))) {
            String txHash = (String) blockchainResult.get("transactionHash");
            auditLog.setBlockchainTxHash(txHash);
            auditLog.setBlockchainStatus("CONFIRMED");
            auditLog.setBlockchainNetwork("ETHEREUM"); // or get from blockchainResult
            auditLogRepository.save(auditLog);
        } else {
            auditLog.setBlockchainStatus("FAILED");
            if (blockchainResult != null) {
                auditLog.setErrorMessage("Blockchain logging failed: " + blockchainResult.get("error"));
            }
            auditLogRepository.save(auditLog);
        }
    }

    /**
     * Escape CSV field
     */
    private String escapeCsvField(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }
}
