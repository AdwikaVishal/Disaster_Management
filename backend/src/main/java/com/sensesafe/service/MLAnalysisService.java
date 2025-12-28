package com.sensesafe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sensesafe.model.Incident;
import com.sensesafe.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class MLAnalysisService {

    @Value("${ml.base-url}")
    private String mlBaseUrl;

    @Value("${ml.endpoints.fraud}")
    private String fraudEndpoint;

    @Value("${ml.endpoints.risk}")
    private String riskEndpoint;

    @Value("${ml.endpoints.similarity}")
    private String similarityEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Check if ML service is available
     */
    public boolean isMLServiceAvailable() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(mlBaseUrl + "/health", String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Comprehensive ML analysis for incidents
     */
    public Map<String, Object> performComprehensiveAnalysis(Incident incident, User reporter) {
        Map<String, Object> results = new HashMap<>();
        
        // Perform all ML analyses
        Map<String, Object> fraudResult = analyzeFraud(incident, reporter);
        Map<String, Object> riskResult = analyzeRisk(incident);
        Map<String, Object> similarityResult = analyzeSimilarity(incident);
        
        results.put("fraud", fraudResult);
        results.put("risk", riskResult);
        results.put("similarity", similarityResult);
        results.put("mlServiceAvailable", isMLServiceAvailable());
        results.put("analysisTimestamp", LocalDateTime.now().toString());
        
        return results;
    }

    public Map<String, Object> analyzeFraud(Incident incident, User reporter) {
        try {
            Map<String, Object> fraudData = prepareFraudData(incident, reporter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(fraudData, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                mlBaseUrl + fraudEndpoint, request, String.class);

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", jsonResponse.get("success").asBoolean());
            result.put("fraudProbability", jsonResponse.get("fraud_probability").asDouble());
            result.put("isFraud", jsonResponse.get("is_fraud").asBoolean());
            result.put("confidence", jsonResponse.get("confidence").asDouble());
            result.put("mlServiceUsed", true);
            
            return result;
        } catch (Exception e) {
            // Fallback analysis if ML service is unavailable
            return getFallbackFraudAnalysis(incident, reporter);
        }
    }

    public Map<String, Object> analyzeRisk(Incident incident) {
        try {
            Map<String, Object> riskData = prepareRiskData(incident);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(riskData, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                mlBaseUrl + riskEndpoint, request, String.class);

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", jsonResponse.get("success").asBoolean());
            result.put("riskScore", jsonResponse.get("risk_score").asDouble());
            result.put("riskLevel", jsonResponse.get("risk_level").asText());
            result.put("confidence", jsonResponse.get("confidence").asDouble());
            result.put("mlServiceUsed", true);
            
            return result;
        } catch (Exception e) {
            // Fallback analysis if ML service is unavailable
            return getFallbackRiskAnalysis(incident);
        }
    }

    public Map<String, Object> analyzeSimilarity(Incident incident) {
        try {
            Map<String, Object> similarityData = prepareSimilarityData(incident);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(similarityData, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                mlBaseUrl + similarityEndpoint, request, String.class);

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", jsonResponse.get("success").asBoolean());
            result.put("similarIncidents", jsonResponse.get("similar_incidents"));
            result.put("similarityScores", jsonResponse.get("similarity_scores"));
            result.put("topMatchScore", jsonResponse.get("top_match_score").asDouble());
            result.put("mlServiceUsed", true);
            
            return result;
        } catch (Exception e) {
            // Fallback analysis if ML service is unavailable
            return getFallbackSimilarityAnalysis(incident);
        }
    }

    /**
     * Enhanced severity suggestion with ML integration
     */
    public Map<String, Object> suggestSeverity(Incident incident, Map<String, Object> guidedQuestions) {
        try {
            Map<String, Object> data = prepareEnhancedRiskData(incident, guidedQuestions);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(data, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                mlBaseUrl + riskEndpoint, request, String.class);

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", jsonResponse.get("success").asBoolean());
            
            // Map risk level to severity
            String riskLevel = jsonResponse.get("risk_level").asText();
            String suggestedSeverity = mapRiskLevelToSeverity(riskLevel);
            
            result.put("suggestedSeverity", suggestedSeverity);
            result.put("riskScore", jsonResponse.get("risk_score").asDouble());
            result.put("confidence", jsonResponse.get("confidence").asDouble());
            result.put("explanation", generateSeverityExplanation(suggestedSeverity, guidedQuestions));
            result.put("mlServiceUsed", true);
            
            return result;
        } catch (Exception e) {
            return getFallbackSeveritySuggestion(incident, guidedQuestions);
        }
    }

    /**
     * Emergency service recommendations based on ML analysis
     */
    public Map<String, Object> recommendEmergencyServices(Incident incident, Map<String, Object> guidedQuestions) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get ML risk analysis
            Map<String, Object> riskAnalysis = analyzeRisk(incident);
            double riskScore = (Double) riskAnalysis.get("riskScore");
            
            // Analyze guided questions
            boolean hasInjuries = (Boolean) guidedQuestions.getOrDefault("hasInjuries", false);
            boolean hasBleeding = (Boolean) guidedQuestions.getOrDefault("hasBleeding", false);
            boolean hasUnconsciousPeople = (Boolean) guidedQuestions.getOrDefault("hasUnconsciousPeople", false);
            boolean hasFireRisk = (Boolean) guidedQuestions.getOrDefault("hasFireRisk", false);
            boolean hasExplosionRisk = (Boolean) guidedQuestions.getOrDefault("hasExplosionRisk", false);
            boolean isRoadBlocked = (Boolean) guidedQuestions.getOrDefault("isRoadBlocked", false);
            Integer vehiclesInvolved = (Integer) guidedQuestions.getOrDefault("vehiclesInvolved", 0);
            String trafficSeverity = (String) guidedQuestions.getOrDefault("trafficSeverity", "NONE");
            
            // ML-enhanced recommendations
            boolean recommendAmbulance = hasInjuries || hasBleeding || hasUnconsciousPeople || 
                                       incident.getType() == Incident.IncidentType.MEDICAL_EMERGENCY ||
                                       riskScore > 70;
            
            boolean recommendPolice = incident.getType() == Incident.IncidentType.ROAD_ACCIDENT ||
                                    incident.getType() == Incident.IncidentType.VIOLENCE ||
                                    isRoadBlocked || vehiclesInvolved > 1 ||
                                    "SEVERE".equals(trafficSeverity);
            
            boolean recommendFire = hasFireRisk || hasExplosionRisk ||
                                  incident.getType() == Incident.IncidentType.FIRE ||
                                  incident.getType() == Incident.IncidentType.GAS_LEAK;
            
            // Determine urgency based on ML risk score and conditions
            String urgency = "MEDIUM";
            if (hasUnconsciousPeople || hasBleeding || riskScore > 90) {
                urgency = "CRITICAL";
            } else if (hasFireRisk || hasExplosionRisk || riskScore > 75) {
                urgency = "HIGH";
            } else if (riskScore < 40 && !hasInjuries) {
                urgency = "LOW";
            }
            
            String explanation = generateEmergencyServiceExplanation(
                recommendAmbulance, recommendPolice, recommendFire, riskScore, guidedQuestions);
            
            result.put("success", true);
            result.put("recommendAmbulance", recommendAmbulance);
            result.put("recommendPolice", recommendPolice);
            result.put("recommendFire", recommendFire);
            result.put("urgency", urgency);
            result.put("explanation", explanation);
            result.put("riskScore", riskScore);
            result.put("mlServiceUsed", true);
            
        } catch (Exception e) {
            result = getFallbackEmergencyServiceRecommendation(incident, guidedQuestions);
        }
        
        return result;
    }

    private Map<String, Object> prepareFraudData(Incident incident, User reporter) {
        Map<String, Object> data = new HashMap<>();
        
        data.put("incident_type", incident.getType().name().toLowerCase());
        data.put("description_length", incident.getDescription().length());
        data.put("has_media", incident.getMediaUrls() != null && !incident.getMediaUrls().isEmpty() ? 1 : 0);
        data.put("upvotes", incident.getUpvotes());
        data.put("flags", incident.getFlags());
        data.put("duplicate_score", incident.getSimilarityScore() != null ? incident.getSimilarityScore() : 0.0);
        data.put("similarity_to_previous", 0.2); // Default value, could be calculated
        data.put("posted_at_night", isNightTime(incident.getCreatedAt()) ? 1 : 0);
        data.put("account_age_days", java.time.temporal.ChronoUnit.DAYS.between(reporter.getCreatedAt(), LocalDateTime.now()));
        data.put("total_reports_by_user", reporter.getTotalReports());
        data.put("past_fraud_reports", reporter.getFlaggedReports());
        data.put("user_total_flags", reporter.getFlaggedReports());
        data.put("verified_user", reporter.isVerified() ? 1 : 0);
        
        return data;
    }

    private Map<String, Object> prepareRiskData(Incident incident) {
        Map<String, Object> data = new HashMap<>();
        
        data.put("incident_type", incident.getType().name().toLowerCase());
        data.put("severity", incident.getSeverity().name().toLowerCase());
        data.put("description_length", incident.getDescription().length());
        data.put("has_media", incident.getMediaUrls() != null && !incident.getMediaUrls().isEmpty() ? 1 : 0);
        data.put("upvotes", incident.getUpvotes());
        data.put("flags", incident.getFlags());
        data.put("duplicate_score", incident.getSimilarityScore() != null ? incident.getSimilarityScore() : 0.0);
        data.put("injuries_reported", incident.getInjuriesReported());
        data.put("people_involved", incident.getPeopleInvolved());
        data.put("distance_to_responder", incident.getDistanceToResponder() != null ? incident.getDistanceToResponder() : 5.0);
        data.put("near_sensitive_location", incident.getNearSensitiveLocation() ? 1 : 0);
        data.put("time_of_day", getTimeOfDay(incident.getCreatedAt()));
        
        return data;
    }

    private Map<String, Object> prepareEnhancedRiskData(Incident incident, Map<String, Object> guidedQuestions) {
        Map<String, Object> data = prepareRiskData(incident);
        
        // Add guided question data
        if (guidedQuestions != null) {
            data.put("has_injuries", guidedQuestions.getOrDefault("hasInjuries", false));
            data.put("has_bleeding", guidedQuestions.getOrDefault("hasBleeding", false));
            data.put("has_unconscious_people", guidedQuestions.getOrDefault("hasUnconsciousPeople", false));
            data.put("vehicles_involved", guidedQuestions.getOrDefault("vehiclesInvolved", 0));
            data.put("has_fire_risk", guidedQuestions.getOrDefault("hasFireRisk", false));
            data.put("has_explosion_risk", guidedQuestions.getOrDefault("hasExplosionRisk", false));
            data.put("is_road_blocked", guidedQuestions.getOrDefault("isRoadBlocked", false));
            data.put("traffic_severity", guidedQuestions.getOrDefault("trafficSeverity", "NONE"));
        }
        
        return data;
    }

    private Map<String, Object> prepareSimilarityData(Incident incident) {
        Map<String, Object> data = new HashMap<>();
        
        data.put("incident_type", incident.getType().name().toLowerCase());
        data.put("time_of_day", getTimeOfDay(incident.getCreatedAt()));
        data.put("has_media", incident.getMediaUrls() != null && !incident.getMediaUrls().isEmpty() ? 1 : 0);
        data.put("upvotes", incident.getUpvotes());
        data.put("flags", incident.getFlags());
        data.put("injuries_reported", incident.getInjuriesReported());
        data.put("people_involved", incident.getPeopleInvolved());
        data.put("distance_to_responder", incident.getDistanceToResponder() != null ? incident.getDistanceToResponder() : 5.0);
        data.put("near_sensitive_location", incident.getNearSensitiveLocation() ? 1 : 0);
        
        return data;
    }

    private String mapRiskLevelToSeverity(String riskLevel) {
        return switch (riskLevel.toLowerCase()) {
            case "critical" -> "CRITICAL";
            case "high" -> "HIGH";
            case "medium" -> "MEDIUM";
            case "low" -> "LOW";
            default -> "MEDIUM";
        };
    }

    private String generateSeverityExplanation(String severity, Map<String, Object> guidedQuestions) {
        StringBuilder explanation = new StringBuilder("ML Analysis suggests ");
        explanation.append(severity.toLowerCase()).append(" severity based on: ");
        
        List<String> factors = new ArrayList<>();
        
        if (guidedQuestions != null) {
            if ((Boolean) guidedQuestions.getOrDefault("hasUnconsciousPeople", false)) {
                factors.add("unconscious people reported");
            }
            if ((Boolean) guidedQuestions.getOrDefault("hasBleeding", false)) {
                factors.add("bleeding injuries");
            }
            if ((Boolean) guidedQuestions.getOrDefault("hasFireRisk", false)) {
                factors.add("fire risk present");
            }
            if ((Boolean) guidedQuestions.getOrDefault("hasExplosionRisk", false)) {
                factors.add("explosion risk");
            }
        }
        
        if (factors.isEmpty()) {
            factors.add("incident type and location analysis");
        }
        
        explanation.append(String.join(", ", factors));
        return explanation.toString();
    }

    private String generateEmergencyServiceExplanation(boolean ambulance, boolean police, boolean fire, 
                                                     double riskScore, Map<String, Object> guidedQuestions) {
        StringBuilder explanation = new StringBuilder("ML-enhanced recommendation (Risk Score: ");
        explanation.append(Math.round(riskScore)).append("%): ");
        
        List<String> services = new ArrayList<>();
        if (ambulance) services.add("Ambulance");
        if (police) services.add("Police");
        if (fire) services.add("Fire Brigade");
        
        if (services.isEmpty()) {
            explanation.append("No emergency services required at this time.");
        } else {
            explanation.append(String.join(" + ", services)).append(" recommended");
        }
        
        return explanation.toString();
    }

    private boolean isNightTime(LocalDateTime dateTime) {
        LocalTime time = dateTime.toLocalTime();
        return time.isAfter(LocalTime.of(22, 0)) || time.isBefore(LocalTime.of(6, 0));
    }

    private String getTimeOfDay(LocalDateTime dateTime) {
        LocalTime time = dateTime.toLocalTime();
        if (time.isBefore(LocalTime.of(6, 0))) return "night";
        if (time.isBefore(LocalTime.of(12, 0))) return "morning";
        if (time.isBefore(LocalTime.of(18, 0))) return "afternoon";
        if (time.isBefore(LocalTime.of(22, 0))) return "evening";
        return "night";
    }

    // Fallback methods when ML service is unavailable
    private Map<String, Object> getFallbackFraudAnalysis(Incident incident, User reporter) {
        Map<String, Object> result = new HashMap<>();
        
        // Simple rule-based fraud detection
        double fraudScore = 0.0;
        
        // Check user trust score
        if (reporter.getTrustScore() < 50) fraudScore += 0.3;
        
        // Check if user has many flagged reports
        if (reporter.getFlaggedReports() > 2) fraudScore += 0.4;
        
        // Check if incident has many flags
        if (incident.getFlags() > incident.getUpvotes()) fraudScore += 0.2;
        
        // Check description length (too short might be suspicious)
        if (incident.getDescription().length() < 20) fraudScore += 0.1;
        
        result.put("success", true);
        result.put("fraudProbability", Math.min(fraudScore, 1.0));
        result.put("isFraud", fraudScore > 0.5);
        result.put("confidence", 0.7);
        result.put("mlServiceUsed", false);
        
        return result;
    }

    private Map<String, Object> getFallbackRiskAnalysis(Incident incident) {
        Map<String, Object> result = new HashMap<>();
        
        // Simple rule-based risk assessment
        double riskScore = 50.0; // Base score
        
        // Incident type risk factors
        switch (incident.getType()) {
            case FIRE -> riskScore += 30;
            case FLOOD -> riskScore += 25;
            case GAS_LEAK -> riskScore += 35;
            case MEDICAL_EMERGENCY -> riskScore += 20;
            case VIOLENCE -> riskScore += 25;
            case ROAD_ACCIDENT -> riskScore += 15;
            default -> riskScore += 10;
        }
        
        // Severity impact
        switch (incident.getSeverity()) {
            case CRITICAL -> riskScore += 20;
            case HIGH -> riskScore += 15;
            case MEDIUM -> riskScore += 10;
            case LOW -> riskScore += 5;
        }
        
        // Injuries and people involved
        riskScore += incident.getInjuriesReported() * 10;
        riskScore += incident.getPeopleInvolved() * 2;
        
        // Near sensitive location
        if (incident.getNearSensitiveLocation()) riskScore += 15;
        
        riskScore = Math.min(riskScore, 100.0);
        
        String riskLevel;
        if (riskScore >= 80) riskLevel = "critical";
        else if (riskScore >= 60) riskLevel = "high";
        else if (riskScore >= 40) riskLevel = "medium";
        else riskLevel = "low";
        
        result.put("success", true);
        result.put("riskScore", riskScore);
        result.put("riskLevel", riskLevel);
        result.put("confidence", 0.8);
        result.put("mlServiceUsed", false);
        
        return result;
    }

    private Map<String, Object> getFallbackSimilarityAnalysis(Incident incident) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("success", true);
        result.put("similarIncidents", new Object[0]);
        result.put("similarityScores", new double[0]);
        result.put("topMatchScore", 0.0);
        result.put("mlServiceUsed", false);
        
        return result;
    }

    private Map<String, Object> getFallbackSeveritySuggestion(Incident incident, Map<String, Object> guidedQuestions) {
        Map<String, Object> result = new HashMap<>();
        
        String suggestedSeverity = "MEDIUM"; // Default
        
        // Rule-based severity suggestion
        if (guidedQuestions != null) {
            if ((Boolean) guidedQuestions.getOrDefault("hasUnconsciousPeople", false) ||
                (Boolean) guidedQuestions.getOrDefault("hasExplosionRisk", false)) {
                suggestedSeverity = "CRITICAL";
            } else if ((Boolean) guidedQuestions.getOrDefault("hasBleeding", false) ||
                      (Boolean) guidedQuestions.getOrDefault("hasFireRisk", false)) {
                suggestedSeverity = "HIGH";
            } else if ((Boolean) guidedQuestions.getOrDefault("hasInjuries", false)) {
                suggestedSeverity = "MEDIUM";
            }
        }
        
        result.put("success", true);
        result.put("suggestedSeverity", suggestedSeverity);
        result.put("confidence", 0.7);
        result.put("explanation", "Rule-based analysis suggests " + suggestedSeverity.toLowerCase() + " severity");
        result.put("mlServiceUsed", false);
        
        return result;
    }

    private Map<String, Object> getFallbackEmergencyServiceRecommendation(Incident incident, Map<String, Object> guidedQuestions) {
        Map<String, Object> result = new HashMap<>();
        
        boolean recommendAmbulance = false;
        boolean recommendPolice = false;
        boolean recommendFire = false;
        String urgency = "MEDIUM";
        
        if (guidedQuestions != null) {
            recommendAmbulance = (Boolean) guidedQuestions.getOrDefault("hasInjuries", false) ||
                               (Boolean) guidedQuestions.getOrDefault("hasBleeding", false) ||
                               (Boolean) guidedQuestions.getOrDefault("hasUnconsciousPeople", false);
            
            recommendPolice = (Boolean) guidedQuestions.getOrDefault("isRoadBlocked", false) ||
                            (Integer) guidedQuestions.getOrDefault("vehiclesInvolved", 0) > 1;
            
            recommendFire = (Boolean) guidedQuestions.getOrDefault("hasFireRisk", false) ||
                          (Boolean) guidedQuestions.getOrDefault("hasExplosionRisk", false);
            
            if ((Boolean) guidedQuestions.getOrDefault("hasUnconsciousPeople", false)) {
                urgency = "CRITICAL";
            } else if (recommendFire) {
                urgency = "HIGH";
            }
        }
        
        result.put("success", true);
        result.put("recommendAmbulance", recommendAmbulance);
        result.put("recommendPolice", recommendPolice);
        result.put("recommendFire", recommendFire);
        result.put("urgency", urgency);
        result.put("explanation", "Rule-based emergency service recommendation");
        result.put("mlServiceUsed", false);
        
        return result;
    }
}