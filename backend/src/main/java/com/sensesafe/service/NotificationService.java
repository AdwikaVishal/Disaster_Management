package com.sensesafe.service;

import com.sensesafe.model.Incident;
import com.sensesafe.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private GeolocationService geolocationService;

    @Async
    public void notifyNewIncident(Incident incident) {
        // Create notification payload
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "NEW_INCIDENT");
        notification.put("incidentId", incident.getId());
        notification.put("title", incident.getTitle());
        notification.put("incidentType", incident.getType().name());
        notification.put("severity", incident.getSeverity().name());
        notification.put("location", Map.of(
            "latitude", incident.getLatitude(),
            "longitude", incident.getLongitude(),
            "address", incident.getAddress()
        ));
        notification.put("timestamp", incident.getCreatedAt());

        // Send to all connected clients
        messagingTemplate.convertAndSend("/topic/incidents", notification);

        // Send to nearby users
        notifyNearbyUsers(incident, notification);

        // Send to admins
        notifyAdmins(incident, notification);
    }

    @Async
    public void notifyIncidentStatusUpdate(Incident incident, Incident.Status oldStatus) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "INCIDENT_STATUS_UPDATE");
        notification.put("incidentId", incident.getId());
        notification.put("oldStatus", oldStatus.name());
        notification.put("newStatus", incident.getStatus().name());
        notification.put("title", incident.getTitle());
        notification.put("timestamp", incident.getUpdatedAt());

        // Send to all connected clients
        messagingTemplate.convertAndSend("/topic/incidents/" + incident.getId(), notification);

        // Notify the reporter
        if (incident.getReporter() != null) {
            String userTopic = "/topic/user/" + incident.getReporter().getId();
            messagingTemplate.convertAndSend(userTopic, notification);
        }

        // Send email notification for important status changes
        if (incident.getStatus() == Incident.Status.VERIFIED || 
            incident.getStatus() == Incident.Status.RESOLVED) {
            sendStatusUpdateEmail(incident, oldStatus);
        }
    }

    @Async
    public void sendEmergencyAlerts(Incident incident) {
        // Send alerts to nearby users
        List<User> nearbyUsers = userService.findUsersWithinRadius(
            incident.getLatitude(), incident.getLongitude(), 5.0 // 5km radius
        );

        for (User user : nearbyUsers) {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                emailService.sendEmergencyAlert(
                    user.getEmail(),
                    incident.getTitle() + " - " + incident.getDescription(),
                    incident.getAddress()
                );
            }
        }

        // Send WebSocket alerts
        Map<String, Object> alert = new HashMap<>();
        alert.put("type", "EMERGENCY_ALERT");
        alert.put("incidentId", incident.getId());
        alert.put("title", incident.getTitle());
        alert.put("description", incident.getDescription());
        alert.put("severity", incident.getSeverity().name());
        alert.put("location", Map.of(
            "latitude", incident.getLatitude(),
            "longitude", incident.getLongitude(),
            "address", incident.getAddress()
        ));

        messagingTemplate.convertAndSend("/topic/emergency-alerts", alert);
    }

    @Async
    public void sendSOSAlert(User user, String message, List<String> emergencyContacts) {
        String userInfo = user.getFirstName() + " " + user.getLastName() + 
                         " (" + user.getPhoneNumber() + ")";
        String location = user.getAddress() != null ? user.getAddress() : 
                         "Lat: " + user.getLatitude() + ", Lng: " + user.getLongitude();

        // Send email alerts to emergency contacts
        emailService.sendEnhancedSOSAlert(
            emergencyContacts, 
            user.getFirstName() + " " + user.getLastName(),
            user.getEmail(),
            user.getPhoneNumber(),
            location,
            user.getLatitude(),
            user.getLongitude(),
            message,
            java.time.LocalDateTime.now()
        );

        // Send WebSocket notification to admins
        Map<String, Object> sosAlert = new HashMap<>();
        sosAlert.put("type", "SOS_ALERT");
        sosAlert.put("userId", user.getId());
        sosAlert.put("userName", user.getFirstName() + " " + user.getLastName());
        sosAlert.put("message", message);
        sosAlert.put("location", location);
        sosAlert.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/sos-alerts", sosAlert);
    }

    @Async
    public void notifyHospitals(Incident incident) {
        // Mock hospital emails - in real app, this would be from database
        List<String> hospitalEmails = List.of(
            "emergency@cityhospital.com",
            "alerts@regionalhospital.com"
        );

        String contactNumber = incident.getReporter().getPhoneNumber() != null ? 
                              incident.getReporter().getPhoneNumber() : "Not provided";

        for (String hospitalEmail : hospitalEmails) {
            emailService.sendHospitalAlert(
                hospitalEmail,
                incident.getTitle() + " - " + incident.getDescription(),
                incident.getAddress(),
                contactNumber
            );
        }
    }

    @Async
    public void notifyVolunteers(Incident incident) {
        // Find volunteers within radius
        List<User> volunteers = userService.findVolunteersWithinRadius(
            incident.getLatitude(), incident.getLongitude(), 10.0 // 10km radius
        );

        Map<String, Object> volunteerAlert = new HashMap<>();
        volunteerAlert.put("type", "VOLUNTEER_ALERT");
        volunteerAlert.put("incidentId", incident.getId());
        volunteerAlert.put("title", incident.getTitle());
        volunteerAlert.put("incidentType", incident.getType().name());
        volunteerAlert.put("severity", incident.getSeverity().name());
        volunteerAlert.put("location", incident.getAddress());
        volunteerAlert.put("distance", null); // Will be calculated per volunteer

        for (User volunteer : volunteers) {
            // Calculate distance for this volunteer
            if (volunteer.getLatitude() != null && volunteer.getLongitude() != null) {
                Double distance = geolocationService.calculateDistance(
                    incident.getLatitude(), incident.getLongitude(),
                    volunteer.getLatitude(), volunteer.getLongitude()
                );
                volunteerAlert.put("distance", String.format("%.1f km", distance));
            }

            String volunteerTopic = "/topic/volunteer/" + volunteer.getId();
            messagingTemplate.convertAndSend(volunteerTopic, volunteerAlert);
        }
    }

    @Async
    public void sendRealTimeUpdate(String topic, Object data) {
        messagingTemplate.convertAndSend(topic, data);
    }

    private void notifyNearbyUsers(Incident incident, Map<String, Object> notification) {
        // Find users within 2km radius
        List<User> nearbyUsers = userService.findUsersWithinRadius(
            incident.getLatitude(), incident.getLongitude(), 2.0
        );

        for (User user : nearbyUsers) {
            String userTopic = "/topic/user/" + user.getId();
            messagingTemplate.convertAndSend(userTopic, notification);
        }
    }

    private void notifyAdmins(Incident incident, Map<String, Object> notification) {
        List<User> admins = userService.findUsersByRole(User.Role.ADMIN);
        
        for (User admin : admins) {
            String adminTopic = "/topic/admin/" + admin.getId();
            messagingTemplate.convertAndSend(adminTopic, notification);
        }
    }

    private void sendStatusUpdateEmail(Incident incident, Incident.Status oldStatus) {
        if (incident.getReporter() != null && incident.getReporter().getEmail() != null) {
            String subject = "Incident Status Update - " + incident.getTitle();
            String message = String.format(
                "Your reported incident '%s' has been updated from %s to %s.",
                incident.getTitle(), oldStatus.name(), incident.getStatus().name()
            );
            
            emailService.sendSimpleEmail(incident.getReporter().getEmail(), subject, message);
        }
    }
}