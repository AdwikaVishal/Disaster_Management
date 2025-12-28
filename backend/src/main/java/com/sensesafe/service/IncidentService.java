package com.sensesafe.service;

import com.sensesafe.model.Incident;
import com.sensesafe.model.User;
import com.sensesafe.model.EmergencyResponse;
import com.sensesafe.model.IncidentVerification;
import com.sensesafe.repository.IncidentRepository;
import com.sensesafe.repository.EmergencyResponseRepository;
import com.sensesafe.repository.IncidentVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;

@Service
@Transactional
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private EmergencyResponseRepository emergencyResponseRepository;

    @Autowired
    private IncidentVerificationRepository verificationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MLAnalysisService mlAnalysisService;

    @Autowired
    private GeolocationService geolocationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SystemConfigService systemConfigService;

    public Incident createIncident(Incident incident) {
        // Set initial values
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());

        // Reverse geocode location if address not provided
        if (incident.getAddress() == null || incident.getAddress().isEmpty()) {
            String address = geolocationService.reverseGeocode(incident.getLatitude(), incident.getLongitude());
            incident.setAddress(address);
        }

        // Calculate distance to nearest responder
        Double distance = geolocationService.calculateDistanceToNearestResponder(
                incident.getLatitude(), incident.getLongitude(), incident.getType());
        incident.setDistanceToResponder(distance);

        // Check if near sensitive location
        boolean nearSensitive = geolocationService.isNearSensitiveLocation(
                incident.getLatitude(), incident.getLongitude());
        incident.setNearSensitiveLocation(nearSensitive);

        // Save incident first
        Incident savedIncident = incidentRepository.save(incident);

        // Perform ML analysis
        performMLAnalysis(savedIncident);

        // Update user report count
        userService.incrementReportCount(incident.getReporter().getId());

        // Send real-time notifications
        notificationService.notifyNewIncident(savedIncident);

        // Broadcast new incident via WebSocket
        webSocketService.broadcastNewIncident(savedIncident);

        // Log incident creation in audit log
        auditLogService.logAction(
            "INCIDENT_REPORTED",
            incident.getReporter().getId().toString(),
            incident.getReporter().getRole().name(),
            "INCIDENT",
            savedIncident.getId().toString(),
            String.format("%s incident reported in %s", incident.getType().name(), incident.getAddress()),
            null, // IP address would be set by controller
            null, // User agent would be set by controller
            "SUCCESS",
            null
        );

        // Auto-dispatch emergency services for critical incidents (if enabled)
        if (savedIncident.getSeverity() == Incident.Severity.CRITICAL && 
            systemConfigService.isAutoDispatchEnabled()) {
            autoDispatchEmergencyServices(savedIncident);
        }

        return savedIncident;
    }

    public Optional<Incident> findById(Long id) {
        return incidentRepository.findById(id);
    }

    public List<Incident> findAllIncidents() {
        return incidentRepository.findAll();
    }

    public List<Incident> findRecentIncidents(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return incidentRepository.findRecentIncidents(since);
    }

    public List<Incident> findIncidentsByStatus(Incident.Status status) {
        return incidentRepository.findByStatus(status);
    }

    public List<Incident> findIncidentsNearLocation(Double latitude, Double longitude, Double radiusKm) {
        return incidentRepository.findIncidentsWithinRadius(latitude, longitude, radiusKm);
    }

    public List<Incident> findActiveIncidentsNearLocation(Double latitude, Double longitude, Double radiusKm) {
        return incidentRepository.findActiveIncidentsWithinRadius(
                latitude, longitude, radiusKm, Incident.Status.IN_PROGRESS);
    }

    public List<Incident> findCriticalIncidents() {
        return incidentRepository.findCriticalActiveIncidents();
    }

    public List<Incident> findHighRiskIncidents(Double minRiskScore) {
        return incidentRepository.findHighRiskIncidents(minRiskScore);
    }

    public Incident updateIncidentStatus(Long incidentId, Incident.Status newStatus, Long adminId) {
        Optional<Incident> incidentOpt = incidentRepository.findById(incidentId);
        if (incidentOpt.isEmpty()) {
            throw new RuntimeException("Incident not found");
        }

        Incident incident = incidentOpt.get();
        Incident.Status oldStatus = incident.getStatus();
        incident.setStatus(newStatus);
        incident.setUpdatedAt(LocalDateTime.now());

        if (newStatus == Incident.Status.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
            // Log resolution on blockchain (async to avoid blocking)
            try {
                Map<String, Object> blockchainResult = blockchainService.logResolved(incidentId);
                if ((Boolean) blockchainResult.get("success")) {
                    System.out.println(
                            "Incident resolution logged on blockchain: " + blockchainResult.get("transactionHash"));
                }
            } catch (Exception e) {
                System.err.println("Failed to log resolution on blockchain: " + e.getMessage());
            }
        } else if (newStatus == Incident.Status.VERIFIED && oldStatus == Incident.Status.NEW) {
            // Update reporter's verified report count
            userService.incrementVerifiedReportCount(incident.getReporter().getId());
            // Log verification on blockchain (async to avoid blocking)
            try {
                Map<String, Object> blockchainResult = blockchainService.logVerified(incidentId);
                if ((Boolean) blockchainResult.get("success")) {
                    System.out.println(
                            "Incident verification logged on blockchain: " + blockchainResult.get("transactionHash"));
                }
            } catch (Exception e) {
                System.err.println("Failed to log verification on blockchain: " + e.getMessage());
            }
        }

        Incident updatedIncident = incidentRepository.save(incident);

        // Log status change in audit log
        String auditAction = switch (newStatus) {
            case VERIFIED -> "INCIDENT_VERIFIED";
            case RESOLVED -> "INCIDENT_RESOLVED";
            case REJECTED -> "INCIDENT_REJECTED";
            case IN_PROGRESS -> "INCIDENT_IN_PROGRESS";
            default -> "INCIDENT_STATUS_CHANGED";
        };

        auditLogService.logAction(
            auditAction,
            adminId != null ? adminId.toString() : "System",
            "ADMIN",
            "INCIDENT",
            incidentId.toString(),
            String.format("Incident status changed from %s to %s", oldStatus.name(), newStatus.name()),
            null, // IP address would be set by controller
            null, // User agent would be set by controller
            "SUCCESS",
            null
        );

        // Send status update notifications
        notificationService.notifyIncidentStatusUpdate(updatedIncident, oldStatus);

        return updatedIncident;
    }

    public IncidentVerification verifyIncident(Long incidentId, Long verifierId,
            IncidentVerification.VerificationType type,
            Boolean isAccurate, String comments) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        User verifier = userService.findById(verifierId)
                .orElseThrow(() -> new RuntimeException("Verifier not found"));

        IncidentVerification verification = new IncidentVerification(incident, verifier, type, isAccurate);
        verification.setComments(comments);
        verification = verificationRepository.save(verification);

        // Update incident verification count and flags
        if (type == IncidentVerification.VerificationType.UPVOTE) {
            incident.setUpvotes(incident.getUpvotes() + 1);
        } else if (type == IncidentVerification.VerificationType.FLAG) {
            incident.setFlags(incident.getFlags() + 1);
        }

        incident.setVerificationCount(incident.getVerificationCount() + 1);
        incidentRepository.save(incident);

        // Re-run ML analysis to update fraud/risk scores based on new feedback
        performMLAnalysis(incident);

        // Check if incident should be auto-verified based on community consensus
        checkAutoVerification(incident);

        return verification;
    }

    public List<Incident> findSimilarIncidents(Long incidentId, Double threshold) {
        return incidentRepository.findSimilarIncidents(threshold, incidentId);
    }

    public Map<String, Object> getIncidentStatistics(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        Long totalIncidents = incidentRepository.countIncidentsAfter(since);
        List<Object[]> typeStats = incidentRepository.getIncidentTypeStatistics(since);
        List<Object[]> severityStats = incidentRepository.getIncidentSeverityStatistics(since);

        return Map.of(
                "totalIncidents", totalIncidents,
                "typeStatistics", typeStats,
                "severityStatistics", severityStats,
                "period", days + " days");
    }

    public Map<String, Object> getAnalytics(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);

        List<Incident> incidents = incidentRepository.findRecentIncidents(since);

        // Calculate analytics
        Map<String, Object> analytics = new HashMap<>();

        // Incidents by type
        Map<String, Long> typeCount = incidents.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        incident -> incident.getType().name(),
                        java.util.stream.Collectors.counting()));
        analytics.put("incidentsByType", typeCount);

        // Risk by area (simplified - group by first part of address)
        Map<String, Double> riskByArea = incidents.stream()
                .filter(i -> i.getAddress() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        incident -> incident.getAddress().split(",")[0].trim(),
                        java.util.stream.Collectors.averagingDouble(
                                incident -> incident.getRiskScore() != null ? incident.getRiskScore() : 50.0)));
        analytics.put("riskByArea", riskByArea);

        // Severity distribution
        Map<String, Long> severityCount = incidents.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        incident -> incident.getSeverity().name(),
                        java.util.stream.Collectors.counting()));
        analytics.put("severityDistribution", severityCount);

        // Real-time metrics
        long activeIncidents = incidents.stream()
                .filter(i -> i.getStatus() == Incident.Status.IN_PROGRESS || i.getStatus() == Incident.Status.NEW)
                .count();

        long criticalIncidents = incidents.stream()
                .filter(i -> i.getSeverity() == Incident.Severity.CRITICAL)
                .count();

        long duplicateDetected = incidents.stream()
                .filter(i -> i.getSimilarityScore() != null && i.getSimilarityScore() > 0.8)
                .count();

        Map<String, Object> realTimeMetrics = new HashMap<>();
        realTimeMetrics.put("totalIncidents", incidents.size());
        realTimeMetrics.put("activeIncidents", activeIncidents);
        realTimeMetrics.put("criticalIncidents", criticalIncidents);
        realTimeMetrics.put("duplicateDetected", duplicateDetected);
        realTimeMetrics.put("mlAccuracy", 87.5 + Math.random() * 10); // Mock ML accuracy

        analytics.put("realTimeMetrics", realTimeMetrics);

        return analytics;
    }

    private void performMLAnalysis(Incident incident) {
        try {
            // 1. Similarity analysis (First, to feed into fraud detection)
            Map<String, Object> similarityResult = mlAnalysisService.analyzeSimilarity(incident);
            if ((Boolean) similarityResult.get("success")) {
                incident.setSimilarityScore((Double) similarityResult.get("topMatchScore"));
            }

            // 2. Fraud analysis (Uses similarity score)
            Map<String, Object> fraudResult = mlAnalysisService.analyzeFraud(incident, incident.getReporter());
            if ((Boolean) fraudResult.get("success")) {
                incident.setFraudProbability((Double) fraudResult.get("fraudProbability"));
                incident.setIsFraud((Boolean) fraudResult.get("isFraud"));
            }

            // 3. Risk analysis
            Map<String, Object> riskResult = mlAnalysisService.analyzeRisk(incident);
            if ((Boolean) riskResult.get("success")) {
                incident.setRiskScore((Double) riskResult.get("riskScore"));
                incident.setRiskLevel((String) riskResult.get("riskLevel"));
            }

            incidentRepository.save(incident);
        } catch (Exception e) {
            // Log error but don't fail incident creation
            System.err.println("ML analysis failed for incident " + incident.getId() + ": " + e.getMessage());
        }
    }

    private void autoDispatchEmergencyServices(Incident incident) {
        // 1. Get base requirements from static rules
        List<EmergencyResponse.ResponseType> requiredServices = determineRequiredServices(incident.getType());

        // 2. Get ML-enhanced recommendations
        Map<String, Object> guidedQuestions = new HashMap<>();
        guidedQuestions.put("hasInjuries",
                incident.getInjuriesReported() != null && incident.getInjuriesReported() > 0);
        guidedQuestions.put("vehiclesInvolved", incident.getType() == Incident.IncidentType.ROAD_ACCIDENT ? 1 : 0);
        guidedQuestions.put("hasFireRisk", incident.getType() == Incident.IncidentType.FIRE
                || incident.getType() == Incident.IncidentType.GAS_LEAK);

        try {
            Map<String, Object> recommendations = mlAnalysisService.recommendEmergencyServices(incident,
                    guidedQuestions);

            if ((Boolean) recommendations.get("recommendAmbulance")
                    && !requiredServices.contains(EmergencyResponse.ResponseType.AMBULANCE)) {
                requiredServices.add(EmergencyResponse.ResponseType.AMBULANCE);
            }
            if ((Boolean) recommendations.get("recommendPolice")
                    && !requiredServices.contains(EmergencyResponse.ResponseType.POLICE)) {
                requiredServices.add(EmergencyResponse.ResponseType.POLICE);
            }
            if ((Boolean) recommendations.get("recommendFire")
                    && !requiredServices.contains(EmergencyResponse.ResponseType.FIRE_BRIGADE)) {
                requiredServices.add(EmergencyResponse.ResponseType.FIRE_BRIGADE);
            }
        } catch (Exception e) {
            System.err.println("ML recommendation failed, using static rules only: " + e.getMessage());
        }

        for (EmergencyResponse.ResponseType serviceType : requiredServices) {
            EmergencyResponse response = new EmergencyResponse(incident, serviceType,
                    generateResourceId(serviceType));

            // Calculate estimated arrival time
            Integer estimatedArrival = geolocationService.calculateEstimatedArrival(
                    incident.getLatitude(), incident.getLongitude(), serviceType);
            response.setEstimatedArrivalMinutes(estimatedArrival);
            response.setDistanceKm(incident.getDistanceToResponder());

            emergencyResponseRepository.save(response);

            // Log resource allocation in audit log
            auditLogService.logAction(
                "RESOURCE_ASSIGNED",
                "System",
                "SYSTEM",
                "INCIDENT",
                incident.getId().toString(),
                String.format("%s assigned to incident", serviceType.name()),
                null,
                null,
                "SUCCESS",
                null
            );

            // Log resource allocation on blockchain (async to avoid blocking)
            try {
                Map<String, Object> blockchainResult = blockchainService.logResource(incident.getId(),
                        response.getResourceId());
                if ((Boolean) blockchainResult.get("success")) {
                    System.out.println(
                            "Resource allocation logged on blockchain: " + blockchainResult.get("transactionHash"));
                }
            } catch (Exception e) {
                System.err.println("Failed to log resource allocation on blockchain: " + e.getMessage());
            }
        }

        // Send emergency alerts
        notificationService.sendEmergencyAlerts(incident);
    }

    private List<EmergencyResponse.ResponseType> determineRequiredServices(Incident.IncidentType type) {
        // Returns a mutable list to allow adding ML recommendations
        return switch (type) {
            case FIRE -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.FIRE_BRIGADE,
                    EmergencyResponse.ResponseType.AMBULANCE));
            case MEDICAL_EMERGENCY -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.AMBULANCE,
                    EmergencyResponse.ResponseType.HOSPITAL));
            case VIOLENCE -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.POLICE,
                    EmergencyResponse.ResponseType.AMBULANCE));
            case ROAD_ACCIDENT -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.POLICE,
                    EmergencyResponse.ResponseType.AMBULANCE));
            case GAS_LEAK -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.GAS_EMERGENCY,
                    EmergencyResponse.ResponseType.FIRE_BRIGADE));
            case FLOOD -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.RESCUE_TEAM,
                    EmergencyResponse.ResponseType.VOLUNTEER_TEAM));
            default -> new ArrayList<>(List.of(EmergencyResponse.ResponseType.POLICE));
        };
    }

    private String generateResourceId(EmergencyResponse.ResponseType type) {
        return type.name() + "_" + System.currentTimeMillis();
    }

    private void checkAutoVerification(Incident incident) {
        // Auto-verify if enough positive verifications and low fraud probability
        if (incident.getUpvotes() >= 3 && incident.getFlags() <= 1 &&
                (incident.getFraudProbability() == null || incident.getFraudProbability() < 0.3)) {

            if (incident.getStatus() == Incident.Status.NEW) {
                updateIncidentStatus(incident.getId(), Incident.Status.VERIFIED, null);
            }
        }

        // Auto-reject if too many flags or high fraud probability
        if (incident.getFlags() >= 3 ||
                (incident.getFraudProbability() != null && incident.getFraudProbability() > 0.7)) {

            if (incident.getStatus() == Incident.Status.NEW) {
                updateIncidentStatus(incident.getId(), Incident.Status.REJECTED, null);
                userService.incrementFlaggedReportCount(incident.getReporter().getId());
            }
        }
    }
}