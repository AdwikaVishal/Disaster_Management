package com.sensesafe.controller;

import com.sensesafe.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/blockchain")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
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
}