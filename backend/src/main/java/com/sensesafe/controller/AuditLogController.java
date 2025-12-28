package com.sensesafe.controller;

import com.sensesafe.model.AuditLog;
import com.sensesafe.service.AuditLogService;
import com.sensesafe.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private BlockchainService blockchainService;

    /**
     * Get audit logs with pagination and filtering
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        try {
            // Parse sort parameter
            String[] sortParams = sort.split(",");
            Sort.Direction direction = Sort.Direction.fromString(sortParams[1]);
            Sort sortObj = Sort.by(direction, sortParams[0]);

            Pageable pageable = PageRequest.of(page, size, sortObj);
            Page<AuditLog> auditLogs = auditLogService.getAuditLogs(actionType, userId, status, startDate, endDate,
                    pageable);

            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get audit trail for a specific incident
     */
    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<List<AuditLog>> getIncidentAuditTrail(@PathVariable String incidentId) {
        try {
            List<AuditLog> auditTrail = auditLogService.getIncidentAuditTrail(incidentId);
            return ResponseEntity.ok(auditTrail);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get audit logs by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<AuditLog> auditLogs = auditLogService.getAuditLogsByUser(userId, pageable);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get audit logs by action type
     */
    @GetMapping("/action/{actionType}")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByActionType(
            @PathVariable String actionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<AuditLog> auditLogs = auditLogService.getAuditLogsByActionType(actionType, pageable);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent audit logs
     */
    @GetMapping("/recent")
    public ResponseEntity<List<AuditLog>> getRecentLogs(@RequestParam(defaultValue = "50") int limit) {
        try {
            List<AuditLog> recentLogs = auditLogService.getRecentLogs(limit);
            return ResponseEntity.ok(recentLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get audit statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAuditStatistics() {
        try {
            Map<String, Object> statistics = auditLogService.getAuditStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get pending blockchain logs
     */
    @GetMapping("/pending-blockchain")
    public ResponseEntity<List<AuditLog>> getPendingBlockchainLogs() {
        try {
            List<AuditLog> pendingLogs = auditLogService.getPendingBlockchainLogs();
            return ResponseEntity.ok(pendingLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get audit log by ID
     */
    @GetMapping("/logs/{id}")
    public ResponseEntity<AuditLog> getAuditLogById(@PathVariable Long id) {
        try {
            Optional<AuditLog> auditLog = auditLogService.getAuditLogById(id);
            if (auditLog.isPresent()) {
                return ResponseEntity.ok(auditLog.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Find audit log by blockchain transaction hash
     */
    @GetMapping("/blockchain/{txHash}")
    public ResponseEntity<AuditLog> getAuditLogByBlockchainHash(@PathVariable String txHash) {
        try {
            Optional<AuditLog> auditLog = auditLogService.getAuditLogByBlockchainHash(txHash);
            if (auditLog.isPresent()) {
                return ResponseEntity.ok(auditLog.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export audit logs to CSV
     */
    @GetMapping("/export")
    public ResponseEntity<String> exportAuditLogs(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        try {
            String csvContent = auditLogService.exportAuditLogsToCSV(actionType, userId, status, startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("audit-logs-" + System.currentTimeMillis() + ".csv")
                    .build());

            return new ResponseEntity<>(csvContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get blockchain health status
     */
    @GetMapping("/blockchain/status")
    public ResponseEntity<Map<String, Object>> getBlockchainStatus() {
        try {
            Map<String, Object> healthStatus = blockchainService.healthCheck();
            return ResponseEntity.ok(healthStatus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get blockchain audit trail for an incident
     */
    @GetMapping("/blockchain/audit/{incidentId}")
    public ResponseEntity<Map<String, Object>> getBlockchainAuditTrail(@PathVariable Long incidentId) {
        try {
            Map<String, Object> auditTrail = blockchainService.getIncidentAuditTrail(incidentId);
            return ResponseEntity.ok(auditTrail);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Manual blockchain logging endpoint (for testing)
     */
    @PostMapping("/blockchain/log")
    public ResponseEntity<Map<String, Object>> logBlockchainAction(
            @RequestParam String actionType,
            @RequestParam String userId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) String status) {

        try {
            // Create a temporary audit log for blockchain testing
            AuditLog auditLog = new AuditLog(actionType, userId, "ADMIN", status != null ? status : "SUCCESS");
            auditLog.setTargetType(targetType);
            auditLog.setTargetId(targetId);

            Map<String, Object> result = blockchainService.logGenericAudit(auditLog);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all unique action types
     */
    @GetMapping("/action-types")
    public ResponseEntity<List<String>> getActionTypes() {
        try {
            Map<String, Object> stats = auditLogService.getAuditStatistics();
            Map<String, Long> actionCounts = (Map<String, Long>) stats.get("actionTypeCounts");
            List<String> actionTypes = actionCounts.keySet().stream()
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(actionTypes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all unique user roles
     */
    @GetMapping("/user-roles")
    public ResponseEntity<List<String>> getUserRoles() {
        try {
            // This could be enhanced to get from a user service or configuration
            List<String> roles = List.of("ADMIN", "USER", "VOLUNTEER");
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
