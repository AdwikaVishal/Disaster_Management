package com.sensesafe.controller;

import com.sensesafe.model.Incident;
import com.sensesafe.model.IncidentVerification;
import com.sensesafe.model.User;
import com.sensesafe.security.JwtUtil;
import com.sensesafe.service.IncidentService;
import com.sensesafe.service.UserService;
import com.sensesafe.service.GeolocationService;
import com.sensesafe.service.MLAnalysisService;
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
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private UserService userService;

    @Autowired
    private GeolocationService geolocationService;

    @Autowired
    private MLAnalysisService mlAnalysisService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/emergency-recommendations")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> getEmergencyRecommendations(@RequestBody EmergencyRecommendationRequest request) {
        // ... method content kept same? NO, I am replacing the method header too.
        // Wait, replace_file_content replaces a contiguous block.
        // I will focus on the specific changes requested.
        try {
            // Create a temporary incident for analysis
            Incident tempIncident = new Incident();
            tempIncident.setType(request.getType());
            tempIncident.setDescription(request.getDescription());
            tempIncident.setLatitude(request.getLatitude());
            tempIncident.setLongitude(request.getLongitude());
            tempIncident.setInjuriesReported(request.getInjuriesReported() != null ? request.getInjuriesReported() : 0);
            tempIncident.setPeopleInvolved(request.getPeopleInvolved() != null ? request.getPeopleInvolved() : 0);
            tempIncident.setCreatedAt(java.time.LocalDateTime.now());
            tempIncident.setSeverity(Incident.Severity.MEDIUM); // Default for analysis

            // Prepare guided questions data
            Map<String, Object> guidedQuestions = new HashMap<>();
            guidedQuestions.put("hasInjuries", request.getHasInjuries());
            guidedQuestions.put("hasBleeding", request.getHasBleeding());
            guidedQuestions.put("hasUnconsciousPeople", request.getHasUnconsciousPeople());
            guidedQuestions.put("vehiclesInvolved", request.getVehiclesInvolved());
            guidedQuestions.put("hasFireRisk", request.getHasFireRisk());
            guidedQuestions.put("hasExplosionRisk", request.getHasExplosionRisk());
            guidedQuestions.put("isRoadBlocked", request.getIsRoadBlocked());
            guidedQuestions.put("trafficSeverity", request.getTrafficSeverity());

            // Use ML-enhanced emergency service recommendations
            Map<String, Object> mlResult = mlAnalysisService.recommendEmergencyServices(tempIncident, guidedQuestions);

            return ResponseEntity.ok(mlResult);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ... skipping other methods until createIncident ...

    @PostMapping
    public ResponseEntity<?> createIncident(@Valid @RequestBody CreateIncidentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User reporter = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    reporter = userService.findById(userId).orElse(null);
                } catch (Exception e) {
                    // Invalid token, treat as anonymous
                    System.out.println("Invalid token in createIncident: " + e.getMessage());
                }
            }

            // Defaults for simplified request
            String title = request.getTitle() != null ? request.getTitle() : "Incident Report";
            Incident.IncidentType type = request.getType() != null ? request.getType() : Incident.IncidentType.OTHER;
            Incident.Severity severity = request.getSeverity() != null ? request.getSeverity()
                    : Incident.Severity.MEDIUM;

            Incident incident = new Incident(
                    title,
                    request.getDescription(),
                    type,
                    severity,
                    request.getLatitude(),
                    request.getLongitude(),
                    reporter);

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

            // Handle tags if present (append to description for now as no tags field
            // exists)
            if (request.getTags() != null && !request.getTags().isEmpty()) {
                String tagString = String.join(", ", request.getTags());
                incident.setDescription(incident.getDescription() + "\nTags: " + tagString);
            }

            Incident savedIncident = incidentService.createIncident(incident);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Incident reported successfully");
            response.put("incident", createIncidentResponse(savedIncident));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create incident: " + e.getMessage());
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
                    id, verifierId, request.getType(), request.getIsAccurate(), request.getComments());

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

    @GetMapping("/ml-health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMLServiceHealth() {
        try {
            boolean isAvailable = mlAnalysisService.isMLServiceAvailable();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mlServiceAvailable", isAvailable);
            response.put("status", isAvailable ? "healthy" : "unavailable");
            response.put("fallbackMode", !isAvailable);
            response.put("timestamp", java.time.LocalDateTime.now().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("mlServiceAvailable", false);
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAnalytics(@RequestParam(defaultValue = "24") int hours) {
        try {
            Map<String, Object> analytics = incidentService.getAnalytics(hours);

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
        private java.util.Set<String> tags;

        // Getters and setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Incident.IncidentType getType() {
            return type;
        }

        public void setType(Incident.IncidentType type) {
            this.type = type;
        }

        public Incident.Severity getSeverity() {
            return severity;
        }

        public void setSeverity(Incident.Severity severity) {
            this.severity = severity;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getLandmark() {
            return landmark;
        }

        public void setLandmark(String landmark) {
            this.landmark = landmark;
        }

        public java.util.Set<String> getMediaUrls() {
            return mediaUrls;
        }

        public void setMediaUrls(java.util.Set<String> mediaUrls) {
            this.mediaUrls = mediaUrls;
        }

        public Integer getInjuriesReported() {
            return injuriesReported;
        }

        public void setInjuriesReported(Integer injuriesReported) {
            this.injuriesReported = injuriesReported;
        }

        public Integer getPeopleInvolved() {
            return peopleInvolved;
        }

        public void setPeopleInvolved(Integer peopleInvolved) {
            this.peopleInvolved = peopleInvolved;
        }

        public java.util.Set<String> getTags() {
            return tags;
        }

        public void setTags(java.util.Set<String> tags) {
            this.tags = tags;
        }
    }

    public static class VerifyIncidentRequest {
        private IncidentVerification.VerificationType type;
        private Boolean isAccurate;
        private String comments;

        public IncidentVerification.VerificationType getType() {
            return type;
        }

        public void setType(IncidentVerification.VerificationType type) {
            this.type = type;
        }

        public Boolean getIsAccurate() {
            return isAccurate;
        }

        public void setIsAccurate(Boolean isAccurate) {
            this.isAccurate = isAccurate;
        }

        public String getComments() {
            return comments;
        }

        public void setComments(String comments) {
            this.comments = comments;
        }
    }

    public static class EmergencyRecommendationRequest {
        private Incident.IncidentType type;
        private String description;
        private Double latitude;
        private Double longitude;
        private Integer injuriesReported;
        private Integer peopleInvolved;
        private Boolean hasInjuries;
        private Boolean hasBleeding;
        private Boolean hasUnconsciousPeople;
        private Integer vehiclesInvolved;
        private Boolean hasFireRisk;
        private Boolean hasExplosionRisk;
        private Boolean isRoadBlocked;
        private String trafficSeverity;

        // Getters and setters
        public Incident.IncidentType getType() {
            return type;
        }

        public void setType(Incident.IncidentType type) {
            this.type = type;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public Integer getInjuriesReported() {
            return injuriesReported;
        }

        public void setInjuriesReported(Integer injuriesReported) {
            this.injuriesReported = injuriesReported;
        }

        public Integer getPeopleInvolved() {
            return peopleInvolved;
        }

        public void setPeopleInvolved(Integer peopleInvolved) {
            this.peopleInvolved = peopleInvolved;
        }

        public Boolean getHasInjuries() {
            return hasInjuries;
        }

        public void setHasInjuries(Boolean hasInjuries) {
            this.hasInjuries = hasInjuries;
        }

        public Boolean getHasBleeding() {
            return hasBleeding;
        }

        public void setHasBleeding(Boolean hasBleeding) {
            this.hasBleeding = hasBleeding;
        }

        public Boolean getHasUnconsciousPeople() {
            return hasUnconsciousPeople;
        }

        public void setHasUnconsciousPeople(Boolean hasUnconsciousPeople) {
            this.hasUnconsciousPeople = hasUnconsciousPeople;
        }

        public Integer getVehiclesInvolved() {
            return vehiclesInvolved;
        }

        public void setVehiclesInvolved(Integer vehiclesInvolved) {
            this.vehiclesInvolved = vehiclesInvolved;
        }

        public Boolean getHasFireRisk() {
            return hasFireRisk;
        }

        public void setHasFireRisk(Boolean hasFireRisk) {
            this.hasFireRisk = hasFireRisk;
        }

        public Boolean getHasExplosionRisk() {
            return hasExplosionRisk;
        }

        public void setHasExplosionRisk(Boolean hasExplosionRisk) {
            this.hasExplosionRisk = hasExplosionRisk;
        }

        public Boolean getIsRoadBlocked() {
            return isRoadBlocked;
        }

        public void setIsRoadBlocked(Boolean isRoadBlocked) {
            this.isRoadBlocked = isRoadBlocked;
        }

        public String getTrafficSeverity() {
            return trafficSeverity;
        }

        public void setTrafficSeverity(String trafficSeverity) {
            this.trafficSeverity = trafficSeverity;
        }
    }

    public static class SeveritySuggestionRequest {
        private Incident.IncidentType type;
        private String description;
        private Double latitude;
        private Double longitude;
        private Integer injuriesReported;
        private Integer peopleInvolved;
        private Boolean nearSensitiveLocation;
        // Guided questions fields
        private Boolean hasInjuries;
        private Boolean hasBleeding;
        private Boolean hasUnconsciousPeople;
        private Integer vehiclesInvolved;
        private Boolean hasFireRisk;
        private Boolean hasExplosionRisk;
        private Boolean isRoadBlocked;
        private String trafficSeverity;

        // Getters and setters
        public Incident.IncidentType getType() {
            return type;
        }

        public void setType(Incident.IncidentType type) {
            this.type = type;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public Integer getInjuriesReported() {
            return injuriesReported;
        }

        public void setInjuriesReported(Integer injuriesReported) {
            this.injuriesReported = injuriesReported;
        }

        public Integer getPeopleInvolved() {
            return peopleInvolved;
        }

        public void setPeopleInvolved(Integer peopleInvolved) {
            this.peopleInvolved = peopleInvolved;
        }

        public Boolean getNearSensitiveLocation() {
            return nearSensitiveLocation;
        }

        public void setNearSensitiveLocation(Boolean nearSensitiveLocation) {
            this.nearSensitiveLocation = nearSensitiveLocation;
        }

        public Boolean getHasInjuries() {
            return hasInjuries;
        }

        public void setHasInjuries(Boolean hasInjuries) {
            this.hasInjuries = hasInjuries;
        }

        public Boolean getHasBleeding() {
            return hasBleeding;
        }

        public void setHasBleeding(Boolean hasBleeding) {
            this.hasBleeding = hasBleeding;
        }

        public Boolean getHasUnconsciousPeople() {
            return hasUnconsciousPeople;
        }

        public void setHasUnconsciousPeople(Boolean hasUnconsciousPeople) {
            this.hasUnconsciousPeople = hasUnconsciousPeople;
        }

        public Integer getVehiclesInvolved() {
            return vehiclesInvolved;
        }

        public void setVehiclesInvolved(Integer vehiclesInvolved) {
            this.vehiclesInvolved = vehiclesInvolved;
        }

        public Boolean getHasFireRisk() {
            return hasFireRisk;
        }

        public void setHasFireRisk(Boolean hasFireRisk) {
            this.hasFireRisk = hasFireRisk;
        }

        public Boolean getHasExplosionRisk() {
            return hasExplosionRisk;
        }

        public void setHasExplosionRisk(Boolean hasExplosionRisk) {
            this.hasExplosionRisk = hasExplosionRisk;
        }

        public Boolean getIsRoadBlocked() {
            return isRoadBlocked;
        }

        public void setIsRoadBlocked(Boolean isRoadBlocked) {
            this.isRoadBlocked = isRoadBlocked;
        }

        public String getTrafficSeverity() {
            return trafficSeverity;
        }

        public void setTrafficSeverity(String trafficSeverity) {
            this.trafficSeverity = trafficSeverity;
        }
    }
}