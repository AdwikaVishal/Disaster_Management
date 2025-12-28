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
            incident.getLatitude(), incident.getLongitude(), incident.getType()
        );
        incident.setDistanceToResponder(distance);

        // Check if near sensitive location
        boolean nearSensitive = geolocationService.isNearSensitiveLocation(
            incident.getLatitude(), incident.getLongitude()
        );
        incident.setNearSensitiveLocation(nearSensitive);

        // Save incident first
        Incident savedIncident = incidentRepository.save(incident);

        // Perform ML analysis
        performMLAnalysis(savedIncident);

        // Update user report count
        userService.incrementReportCount(incident.getReporter().getId());

        // Send real-time notifications
        notificationService.notifyNewIncident(savedIncident);

        // Auto-dispatch emergency services for critical incidents
        if (savedIncident.getSeverity() == Incident.Severity.CRITICAL) {
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
            latitude, longitude, radiusKm, Incident.Status.IN_PROGRESS
        );
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
            // Log resolution on blockchain
            blockchainService.logResolved(incidentId);
        } else if (newStatus == Incident.Status.VERIFIED && oldStatus == Incident.Status.NEW) {
            // Update reporter's verified report count
            userService.incrementVerifiedReportCount(incident.getReporter().getId());
            // Log verification on blockchain
            blockchainService.logVerified(incidentId);
        }

        Incident updatedIncident = incidentRepository.save(incident);
        
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
            "period", days + " days"
        );
    }

    private void performMLAnalysis(Incident incident) {
        try {
            // Fraud analysis
            Map<String, Object> fraudResult = mlAnalysisService.analyzeFraud(incident, incident.getReporter());
            if ((Boolean) fraudResult.get("success")) {
                incident.setFraudProbability((Double) fraudResult.get("fraudProbability"));
                incident.setIsFraud((Boolean) fraudResult.get("isFraud"));
            }

            // Risk analysis
            Map<String, Object> riskResult = mlAnalysisService.analyzeRisk(incident);
            if ((Boolean) riskResult.get("success")) {
                incident.setRiskScore((Double) riskResult.get("riskScore"));
                incident.setRiskLevel((String) riskResult.get("riskLevel"));
            }

            // Similarity analysis
            Map<String, Object> similarityResult = mlAnalysisService.analyzeSimilarity(incident);
            if ((Boolean) similarityResult.get("success")) {
                incident.setSimilarityScore((Double) similarityResult.get("topMatchScore"));
            }

            incidentRepository.save(incident);
        } catch (Exception e) {
            // Log error but don't fail incident creation
            System.err.println("ML analysis failed for incident " + incident.getId() + ": " + e.getMessage());
        }
    }

    private void autoDispatchEmergencyServices(Incident incident) {
        // Determine required emergency services based on incident type
        List<EmergencyResponse.ResponseType> requiredServices = 
            determineRequiredServices(incident.getType());

        for (EmergencyResponse.ResponseType serviceType : requiredServices) {
            EmergencyResponse response = new EmergencyResponse(incident, serviceType, 
                generateResourceId(serviceType));
            
            // Calculate estimated arrival time
            Integer estimatedArrival = geolocationService.calculateEstimatedArrival(
                incident.getLatitude(), incident.getLongitude(), serviceType
            );
            response.setEstimatedArrivalMinutes(estimatedArrival);
            response.setDistanceKm(incident.getDistanceToResponder());

            emergencyResponseRepository.save(response);
            
            // Log resource allocation on blockchain
            blockchainService.logResource(incident.getId(), response.getResourceId());
        }

        // Send emergency alerts
        notificationService.sendEmergencyAlerts(incident);
    }

    private List<EmergencyResponse.ResponseType> determineRequiredServices(Incident.IncidentType type) {
        return switch (type) {
            case FIRE -> List.of(EmergencyResponse.ResponseType.FIRE_BRIGADE, 
                               EmergencyResponse.ResponseType.AMBULANCE);
            case MEDICAL_EMERGENCY -> List.of(EmergencyResponse.ResponseType.AMBULANCE, 
                                            EmergencyResponse.ResponseType.HOSPITAL);
            case VIOLENCE -> List.of(EmergencyResponse.ResponseType.POLICE, 
                                   EmergencyResponse.ResponseType.AMBULANCE);
            case ROAD_ACCIDENT -> List.of(EmergencyResponse.ResponseType.POLICE, 
                                        EmergencyResponse.ResponseType.AMBULANCE);
            case GAS_LEAK -> List.of(EmergencyResponse.ResponseType.GAS_EMERGENCY, 
                                   EmergencyResponse.ResponseType.FIRE_BRIGADE);
            case FLOOD -> List.of(EmergencyResponse.ResponseType.RESCUE_TEAM, 
                                EmergencyResponse.ResponseType.VOLUNTEER_TEAM);
            default -> List.of(EmergencyResponse.ResponseType.POLICE);
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