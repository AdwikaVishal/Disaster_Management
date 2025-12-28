package com.sensesafe.controller;

import com.sensesafe.model.Incident;
import com.sensesafe.model.User;
import com.sensesafe.model.SystemConfig;
import com.sensesafe.service.IncidentService;
import com.sensesafe.service.UserService;
import com.sensesafe.service.VolunteerService;
import com.sensesafe.service.MLAnalysisService;
import com.sensesafe.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private UserService userService;

    @Autowired
    private VolunteerService volunteerService;

    @Autowired
    private MLAnalysisService mlAnalysisService;

    @Autowired
    private SystemConfigService systemConfigService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        try {
            Map<String, Object> dashboardData = new HashMap<>();

            // Recent incidents (last 24 hours)
            List<Incident> recentIncidents = incidentService.findRecentIncidents(24);
            dashboardData.put("recentIncidents", recentIncidents.stream()
                    .map(this::createIncidentSummary).toList());

            // Critical incidents
            List<Incident> criticalIncidents = incidentService.findCriticalIncidents();
            dashboardData.put("criticalIncidents", criticalIncidents.stream()
                    .map(this::createIncidentSummary).toList());

            // High risk incidents
            List<Incident> highRiskIncidents = incidentService.findHighRiskIncidents(70.0);
            dashboardData.put("highRiskIncidents", highRiskIncidents.stream()
                    .map(this::createIncidentSummary).toList());

            // Statistics
            Map<String, Object> stats = getSystemStats();
            dashboardData.put("statistics", stats);

            // Risk distribution
            Map<String, Object> riskDistribution = getRiskDistribution();
            dashboardData.put("riskDistribution", riskDistribution);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("dashboard", dashboardData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getSystemStatistics() {
        try {
            Map<String, Object> stats = getSystemStats();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", stats);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String role) {
        try {
            List<User> users;

            if (role != null) {
                User.Role userRole = User.Role.valueOf(role.toUpperCase());
                users = userService.findUsersByRole(userRole);
            } else {
                users = userService.findAllUsers();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users.stream().map(this::createUserSummary).toList());
            response.put("total", users.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> userDetails = createUserDetails(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", userDetails);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/users/{id}/trust-score")
    public ResponseEntity<?> updateUserTrustScore(@PathVariable Long id,
            @RequestBody Map<String, Double> request) {
        try {
            Double newTrustScore = request.get("trustScore");
            userService.updateTrustScore(id, newTrustScore);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Trust score updated successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/incidents/analytics")
    public ResponseEntity<?> getIncidentAnalytics(@RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> analytics = incidentService.getIncidentStatistics(days);

            // Add additional analytics
            analytics.put("riskDistribution", getRiskDistribution());
            analytics.put("fraudDetectionStats", getFraudDetectionStats());
            analytics.put("responseTimeStats", getResponseTimeStats());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("analytics", analytics);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/system-config")
    public ResponseEntity<?> getSystemConfig() {
        try {
            Map<String, Object> configStatus = systemConfigService.getEmergencyControlStatus();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("systemConfig", configStatus);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/system-config/{configKey}")
    public ResponseEntity<?> updateSystemConfig(@PathVariable String configKey,
            @RequestBody Map<String, Object> request) {
        try {
            Boolean enabled = (Boolean) request.get("enabled");
            String updatedBy = getCurrentUsername();

            SystemConfig updatedConfig = systemConfigService.updateConfiguration(configKey, enabled, updatedBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("config", Map.of(
                    "key", updatedConfig.getConfigKey(),
                    "enabled", updatedConfig.getConfigValue(),
                    "description", updatedConfig.getDescription(),
                    "updatedBy", updatedConfig.getUpdatedBy(),
                    "updatedAt", updatedConfig.getUpdatedAt()));
            response.put("message", "System configuration updated successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/system-config/initialize")
    public ResponseEntity<?> initializeSystemConfig() {
        try {
            systemConfigService.initializeDefaultConfigurations();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "System configurations initialized successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/real-time-data")
    public ResponseEntity<?> getRealTimeData() {
        try {
            Map<String, Object> realTimeData = new HashMap<>();

            // Active incidents count
            List<Incident> activeIncidents = incidentService.findIncidentsByStatus(Incident.Status.IN_PROGRESS);
            realTimeData.put("activeIncidentsCount", activeIncidents.size());

            // Recent incidents (last hour)
            List<Incident> recentIncidents = incidentService.findRecentIncidents(1);
            realTimeData.put("recentIncidentsCount", recentIncidents.size());

            // Critical incidents count
            List<Incident> criticalIncidents = incidentService.findCriticalIncidents();
            realTimeData.put("criticalIncidentsCount", criticalIncidents.size());

            // Active users (logged in last 24 hours)
            List<User> activeUsers = userService.getRecentlyActiveUsers(1);
            realTimeData.put("activeUsersCount", activeUsers.size());

            // Pending volunteer applications
            Long pendingApplications = volunteerService.getPendingApplicationCount();
            realTimeData.put("pendingVolunteerApplications", pendingApplications);

            // System health indicators
            realTimeData.put("systemHealth", getSystemHealth());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("realTimeData", realTimeData);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // User statistics
        Long totalUsers = (long) userService.findAllUsers().size();
        Long newUsersThisWeek = userService.getNewUserCount(7);
        Long activeVolunteers = volunteerService.getActiveVolunteerCount();

        stats.put("totalUsers", totalUsers);
        stats.put("newUsersThisWeek", newUsersThisWeek);
        stats.put("activeVolunteers", activeVolunteers);

        // Incident statistics
        Map<String, Object> incidentStats = incidentService.getIncidentStatistics(30);
        stats.put("incidentStatistics", incidentStats);

        // Volunteer statistics
        Map<String, Object> volunteerStats = volunteerService.getVolunteerStatistics(30);
        stats.put("volunteerStatistics", volunteerStats);

        return stats;
    }

    private Map<String, Object> getRiskDistribution() {
        Map<String, Object> distribution = new HashMap<>();

        // Mock risk distribution data - in real app, this would query the database
        distribution.put("low", 45);
        distribution.put("medium", 30);
        distribution.put("high", 20);
        distribution.put("critical", 5);

        return distribution;
    }

    private Map<String, Object> getFraudDetectionStats() {
        Map<String, Object> stats = new HashMap<>();

        // Mock fraud detection statistics
        stats.put("totalAnalyzed", 1250);
        stats.put("fraudDetected", 23);
        stats.put("falsePositives", 5);
        stats.put("accuracy", 98.2);

        return stats;
    }

    private Map<String, Object> getResponseTimeStats() {
        Map<String, Object> stats = new HashMap<>();

        // Mock response time statistics
        stats.put("averageResponseTime", 8.5); // minutes
        stats.put("fastestResponse", 2.1);
        stats.put("slowestResponse", 25.3);
        stats.put("targetResponseTime", 10.0);

        return stats;
    }

    private Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();

        health.put("database", "healthy");
        health.put("mlServices", "healthy");
        health.put("emailService", "healthy");
        health.put("blockchain", "degraded"); // Since it's simulated
        health.put("websocket", "healthy");

        return health;
    }

    private Map<String, Object> createIncidentSummary(Incident incident) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", incident.getId());
        summary.put("title", incident.getTitle());
        summary.put("type", incident.getType().name());
        summary.put("severity", incident.getSeverity().name());
        summary.put("status", incident.getStatus().name());
        summary.put("location", incident.getAddress());
        summary.put("riskScore", incident.getRiskScore());
        summary.put("fraudProbability", incident.getFraudProbability());
        summary.put("createdAt", incident.getCreatedAt());
        return summary;
    }

    private Map<String, Object> createUserSummary(User user) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", user.getId());
        summary.put("username", user.getUsername());
        summary.put("firstName", user.getFirstName());
        summary.put("lastName", user.getLastName());
        summary.put("email", user.getEmail());
        summary.put("role", user.getRole().name());
        summary.put("trustScore", user.getTrustScore());
        summary.put("totalReports", user.getTotalReports());
        summary.put("verifiedReports", user.getVerifiedReports());
        summary.put("createdAt", user.getCreatedAt());
        summary.put("lastLogin", user.getLastLogin());
        return summary;
    }

    private Map<String, Object> createUserDetails(User user) {
        Map<String, Object> details = createUserSummary(user);
        details.put("phoneNumber", user.getPhoneNumber());
        details.put("address", user.getAddress());
        details.put("verified", user.isVerified());
        details.put("enabled", user.isEnabled());
        details.put("flaggedReports", user.getFlaggedReports());
        details.put("emergencyContact1", user.getEmergencyContact1());
        details.put("emergencyContact2", user.getEmergencyContact2());
        details.put("emergencyContact3", user.getEmergencyContact3());
        return details;
    }

    /**
     * Get current authenticated username
     * 
     * @return username string
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "SYSTEM";
    }
}
