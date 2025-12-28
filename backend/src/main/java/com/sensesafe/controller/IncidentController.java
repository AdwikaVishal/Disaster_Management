package com.sensesafe.controller;

import com.sensesafe.model.Incident;
import com.sensesafe.model.IncidentVerification;
import com.sensesafe.model.User;
import com.sensesafe.security.JwtUtil;
import com.sensesafe.service.IncidentService;
import com.sensesafe.service.UserService;
import com.sensesafe.service.GeolocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/incidents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private UserService userService;

    @Autowired
    private GeolocationService geolocationService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> createIncident(@Valid @RequestBody CreateIncidentRequest request,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            
            User reporter = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            Incident incident = new Incident(
                request.getTitle(),
                request.getDescription(),
                request.getType(),
                request.getSeverity(),
                request.getLatitude(),
                request.getLongitude(),
                reporter
            );

            if (request.getAddress() != null) {
                incident.setAddress(request.getAddress());
            }
            if (request.getLandmark() != null) {
                incident.setLandmark(request.getLandmark());
            }
            if (request.getMediaUrls() != null) {
                incident.setMediaUrls(request.getMediaUrls());
            }
            if (request.getInjuriesReported() != null) {
                incident.setInjuriesReported(request.getInjuriesReported());
            }
            if (request.getPeopleInvolved() != null) {
                incident.setPeopleInvolved(request.getPeopleInvolved());
            }

            Incident savedIncident = incidentService.createIncident(incident);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Incident reported successfully");
            response.put("incident", createIncidentResponse(savedIncident));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllIncidents(@RequestParam(defaultValue = "24") int hours) {
        try {
            List<Incident> incidents = incidentService.findRecentIncidents(hours);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incidents", incidents.stream().map(this::createIncidentResponse).toList());
            response.put("total", incidents.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncident(@PathVariable Long id) {
        try {
            Optional<Incident> incident = incidentService.findById(id);
            
            if (incident.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Incident not found");
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incident", createIncidentResponse(incident.get()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyIncidents(@RequestParam Double latitude,
                                              @RequestParam Double longitude,
                                              @RequestParam(defaultValue = "10.0") Double radiusKm) {
        try {
            List<Incident> incidents = incidentService.findIncidentsNearLocation(latitude, longitude, radiusKm);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incidents", incidents.stream().map(this::createIncidentResponse).toList());
            response.put("center", Map.of("latitude", latitude, "longitude", longitude));
            response.put("radius", radiusKm);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/critical")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> getCriticalIncidents() {
        try {
            List<Incident> incidents = incidentService.findCriticalIncidents();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incidents", incidents.stream().map(this::createIncidentResponse).toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/high-risk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getHighRiskIncidents(@RequestParam(defaultValue = "70.0") Double minRiskScore) {
        try {
            List<Incident> incidents = incidentService.findHighRiskIncidents(minRiskScore);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("incidents", incidents.stream().map(this::createIncidentResponse).toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateIncidentStatus(@PathVariable Long id,
                                                @RequestBody Map<String, String> request,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long adminId = jwtUtil.extractUserId(token);
            
            Incident.Status newStatus = Incident.Status.valueOf(request.get("status"));
            Incident updatedIncident = incidentService.updateIncidentStatus(id, newStatus, adminId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Incident status updated successfully");
            response.put("incident", createIncidentResponse(updatedIncident));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> verifyIncident(@PathVariable Long id,
                                          @RequestBody VerifyIncidentRequest request,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long verifierId = jwtUtil.extractUserId(token);

            IncidentVerification verification = incidentService.verifyIncident(
                id, verifierId, request.getType(), request.getIsAccurate(), request.getComments()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Incident verification recorded");
            response.put("verification", createVerificationResponse(verification));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<?> getSimilarIncidents(@PathVariable Long id,
                                               @RequestParam(defaultValue = "0.7") Double threshold) {
        try {
            List<Incident> similarIncidents = incidentService.findSimilarIncidents(id, threshold);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("similarIncidents", similarIncidents.stream().map(this::createIncidentResponse).toList());
            response.put("threshold", threshold);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getIncidentStatistics(@RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> statistics = incidentService.getIncidentStatistics(days);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/location-info")
    public ResponseEntity<?> getLocationInfo(@RequestParam Double latitude,
                                           @RequestParam Double longitude) {
        try {
            Map<String, Object> locationInfo = geolocationService.getLocationInfo(latitude, longitude);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("locationInfo", locationInfo);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Map<String, Object> createIncidentResponse(Incident incident) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", incident.getId());
        response.put("title", incident.getTitle());
        response.put("description", incident.getDescription());
        response.put("type", incident.getType().name());
        response.put("severity", incident.getSeverity().name());
        response.put("status", incident.getStatus().name());
        response.put("latitude", incident.getLatitude());
        response.put("longitude", incident.getLongitude());
        response.put("address", incident.getAddress());
        response.put("landmark", incident.getLandmark());
        response.put("mediaUrls", incident.getMediaUrls());
        response.put("upvotes", incident.getUpvotes());
        response.put("flags", incident.getFlags());
        response.put("verificationCount", incident.getVerificationCount());
        response.put("injuriesReported", incident.getInjuriesReported());
        response.put("peopleInvolved", incident.getPeopleInvolved());
        response.put("nearSensitiveLocation", incident.getNearSensitiveLocation());
        response.put("distanceToResponder", incident.getDistanceToResponder());
        response.put("fraudProbability", incident.getFraudProbability());
        response.put("isFraud", incident.getIsFraud());
        response.put("riskScore", incident.getRiskScore());
        response.put("riskLevel", incident.getRiskLevel());
        response.put("similarityScore", incident.getSimilarityScore());
        response.put("blockchainTxHash", incident.getBlockchainTxHash());
        response.put("blockchainVerified", incident.getBlockchainVerified());
        response.put("createdAt", incident.getCreatedAt());
        response.put("updatedAt", incident.getUpdatedAt());
        response.put("resolvedAt", incident.getResolvedAt());
        
        if (incident.getReporter() != null) {
            Map<String, Object> reporter = new HashMap<>();
            reporter.put("id", incident.getReporter().getId());
            reporter.put("username", incident.getReporter().getUsername());
            reporter.put("firstName", incident.getReporter().getFirstName());
            reporter.put("lastName", incident.getReporter().getLastName());
            reporter.put("trustScore", incident.getReporter().getTrustScore());
            reporter.put("verified", incident.getReporter().isVerified());
            response.put("reporter", reporter);
        }
        
        return response;
    }

    private Map<String, Object> createVerificationResponse(IncidentVerification verification) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", verification.getId());
        response.put("verificationType", verification.getVerificationType().name());
        response.put("isAccurate", verification.getIsAccurate());
        response.put("comments", verification.getComments());
        response.put("confidenceLevel", verification.getConfidenceLevel());
        response.put("verifiedAt", verification.getVerifiedAt());
        return response;
    }

    // Request DTOs
    public static class CreateIncidentRequest {
        private String title;
        private String description;
        private Incident.IncidentType type;
        private Incident.Severity severity;
        private Double latitude;
        private Double longitude;
        private String address;
        private String landmark;
        private java.util.Set<String> mediaUrls;
        private Integer injuriesReported;
        private Integer peopleInvolved;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Incident.IncidentType getType() { return type; }
        public void setType(Incident.IncidentType type) { this.type = type; }
        public Incident.Severity getSeverity() { return severity; }
        public void setSeverity(Incident.Severity severity) { this.severity = severity; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }
        public java.util.Set<String> getMediaUrls() { return mediaUrls; }
        public void setMediaUrls(java.util.Set<String> mediaUrls) { this.mediaUrls = mediaUrls; }
        public Integer getInjuriesReported() { return injuriesReported; }
        public void setInjuriesReported(Integer injuriesReported) { this.injuriesReported = injuriesReported; }
        public Integer getPeopleInvolved() { return peopleInvolved; }
        public void setPeopleInvolved(Integer peopleInvolved) { this.peopleInvolved = peopleInvolved; }
    }

    public static class VerifyIncidentRequest {
        private IncidentVerification.VerificationType type;
        private Boolean isAccurate;
        private String comments;

        public IncidentVerification.VerificationType getType() { return type; }
        public void setType(IncidentVerification.VerificationType type) { this.type = type; }
        public Boolean getIsAccurate() { return isAccurate; }
        public void setIsAccurate(Boolean isAccurate) { this.isAccurate = isAccurate; }
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }
}