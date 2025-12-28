package com.sensesafe.controller;

import com.sensesafe.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/blockchain")
@PreAuthorize("hasRole('ADMIN')")
public class BlockchainController {

    @Autowired
    private BlockchainService blockchainService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyIncident(@RequestBody Map<String, Object> request) {
        try {
            Long incidentId = Long.valueOf(request.get("incidentId").toString());
            Map<String, Object> result = blockchainService.logVerified(incidentId);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignResource(@RequestBody Map<String, Object> request) {
        try {
            Long incidentId = Long.valueOf(request.get("incidentId").toString());
            String resourceId = request.get("resourceId").toString();

            Map<String, Object> result = blockchainService.logResource(incidentId, resourceId);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resolve")
    public ResponseEntity<?> resolveIncident(@RequestBody Map<String, Object> request) {
        try {
            Long incidentId = Long.valueOf(request.get("incidentId").toString());
            Map<String, Object> result = blockchainService.logResolved(incidentId);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/audit/{incidentId}")
    public ResponseEntity<?> getAuditTrail(@PathVariable Long incidentId) {
        try {
            Map<String, Object> result = blockchainService.getIncidentAuditTrail(incidentId);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/health")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> healthCheck() {
        try {
            Map<String, Object> result = blockchainService.healthCheck();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "unhealthy");
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/status")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getBlockchainStatus() {
        try {
            Map<String, Object> health = blockchainService.healthCheck();
            Map<String, Object> status = new HashMap<>();

            status.put("isConnected", "healthy".equals(health.get("status")));
            status.put("contractAddress", health.get("contractAddress"));
            status.put("latestBlock", health.get("latestBlock"));
            status.put("networkId", health.get("networkId"));
            status.put("abiLoaded", health.get("abiLoaded"));
            status.put("lastChecked", System.currentTimeMillis());

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("isConnected", false);
            response.put("error", e.getMessage());
            response.put("lastChecked", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        }
    }
}