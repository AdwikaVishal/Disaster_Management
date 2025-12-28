package com.sensesafe.service;

import com.sensesafe.model.Incident;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastNewIncident(Incident incident) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "NEW_INCIDENT");
        message.put("incident", createIncidentMessage(incident));
        message.put("timestamp", LocalDateTime.now().toString());
        
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/incidents", message);
    }

    public void broadcastIncidentUpdate(Incident incident) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "INCIDENT_UPDATE");
        message.put("incident", createIncidentMessage(incident));
        message.put("timestamp", LocalDateTime.now().toString());
        
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/incidents", message);
    }

    public void broadcastIncidentStatusChange(Incident incident, String oldStatus, String newStatus) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "STATUS_CHANGE");
        message.put("incident", createIncidentMessage(incident));
        message.put("oldStatus", oldStatus);
        message.put("newStatus", newStatus);
        message.put("timestamp", LocalDateTime.now().toString());
        
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/incidents", message);
    }

    public void broadcastIncidentVerification(Long incidentId, String verificationType, boolean isAccurate) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "INCIDENT_VERIFICATION");
        message.put("incidentId", incidentId);
        message.put("verificationType", verificationType);
        message.put("isAccurate", isAccurate);
        message.put("timestamp", LocalDateTime.now().toString());
        
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/incidents", message);
    }

    public void broadcastEmergencyAlert(String alertType, String message, Double latitude, Double longitude) {
        Map<String, Object> alertMessage = new HashMap<>();
        alertMessage.put("type", "EMERGENCY_ALERT");
        alertMessage.put("alertType", alertType);
        alertMessage.put("message", message);
        alertMessage.put("latitude", latitude);
        alertMessage.put("longitude", longitude);
        alertMessage.put("timestamp", LocalDateTime.now().toString());
        
        // Broadcast emergency alert to all subscribers
        messagingTemplate.convertAndSend("/topic/emergency", alertMessage);
    }

    public void broadcastSystemNotification(String notificationType, String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "SYSTEM_NOTIFICATION");
        notification.put("notificationType", notificationType);
        notification.put("message", message);
        notification.put("timestamp", LocalDateTime.now().toString());
        
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    private Map<String, Object> createIncidentMessage(Incident incident) {
        Map<String, Object> incidentData = new HashMap<>();
        incidentData.put("id", incident.getId());
        incidentData.put("title", incident.getTitle());
        incidentData.put("description", incident.getDescription());
        incidentData.put("type", incident.getType().name());
        incidentData.put("severity", incident.getSeverity().name());
        incidentData.put("status", incident.getStatus().name());
        incidentData.put("latitude", incident.getLatitude());
        incidentData.put("longitude", incident.getLongitude());
        incidentData.put("address", incident.getAddress());
        incidentData.put("mediaUrls", incident.getMediaUrls());
        incidentData.put("upvotes", incident.getUpvotes());
        incidentData.put("flags", incident.getFlags());
        incidentData.put("verificationCount", incident.getVerificationCount());
        incidentData.put("injuriesReported", incident.getInjuriesReported());
        incidentData.put("peopleInvolved", incident.getPeopleInvolved());
        incidentData.put("riskScore", incident.getRiskScore());
        incidentData.put("riskLevel", incident.getRiskLevel());
        incidentData.put("createdAt", incident.getCreatedAt().toString());
        incidentData.put("updatedAt", incident.getUpdatedAt().toString());
        
        if (incident.getReporter() != null) {
            Map<String, Object> reporter = new HashMap<>();
            reporter.put("id", incident.getReporter().getId());
            reporter.put("username", incident.getReporter().getUsername());
            reporter.put("firstName", incident.getReporter().getFirstName());
            reporter.put("lastName", incident.getReporter().getLastName());
            reporter.put("trustScore", incident.getReporter().getTrustScore());
            incidentData.put("reporter", reporter);
        }
        
        return incidentData;
    }
}