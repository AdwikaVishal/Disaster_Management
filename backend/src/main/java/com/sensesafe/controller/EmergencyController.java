package com.sensesafe.controller;

import com.sensesafe.model.User;
import com.sensesafe.security.JwtUtil;
import com.sensesafe.service.UserService;
import com.sensesafe.service.NotificationService;
import com.sensesafe.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Arrays;

@RestController
@RequestMapping("/emergency")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class EmergencyController {

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${emergency.services.fire-department}")
    private String fireDepartmentNumber;

    @Value("${emergency.services.police}")
    private String policeNumber;

    @Value("${emergency.services.ambulance}")
    private String ambulanceNumber;

    @Value("${emergency.services.hospital}")
    private String hospitalNumber;

    @Value("${emergency.services.gas-emergency}")
    private String gasEmergencyNumber;

    @PostMapping("/sos")
    public ResponseEntity<?> sendSOSAlert(@RequestBody SOSRequest request,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = null;
            
            // If user is authenticated, get their info
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Long userId = jwtUtil.extractUserId(token);
                user = userService.findById(userId).orElse(null);
            }

            List<String> emergencyContacts;
            
            if (user != null) {
                // Use user's registered emergency contacts
                emergencyContacts = Arrays.asList(
                    user.getEmergencyContact1(),
                    user.getEmergencyContact2(),
                    user.getEmergencyContact3()
                ).stream().filter(contact -> contact != null && !contact.isEmpty()).toList();
                
                // If no registered contacts, use provided contacts
                if (emergencyContacts.isEmpty() && request.getEmergencyContacts() != null) {
                    emergencyContacts = request.getEmergencyContacts();
                }
            } else {
                // Use provided emergency contacts for anonymous SOS
                emergencyContacts = request.getEmergencyContacts();
            }

            if (emergencyContacts.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No emergency contacts available");
                return ResponseEntity.badRequest().body(response);
            }

            // Send SOS alert
            if (user != null) {
                notificationService.sendSOSAlert(user, request.getMessage(), emergencyContacts);
            } else {
                // Create temporary user info for anonymous SOS
                String userInfo = request.getName() + " (" + request.getPhoneNumber() + ")";
                String location = request.getLocation() != null ? request.getLocation() : 
                                "Lat: " + request.getLatitude() + ", Lng: " + request.getLongitude();
                
                emailService.sendSOSAlert(emergencyContacts, userInfo, location, request.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "SOS alert sent successfully");
            response.put("contactsNotified", emergencyContacts.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/contacts")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> getEmergencyContacts() {
        try {
            Map<String, String> contacts = new HashMap<>();
            contacts.put("fire", fireDepartmentNumber);
            contacts.put("police", policeNumber);
            contacts.put("ambulance", ambulanceNumber);
            contacts.put("hospital", hospitalNumber);
            contacts.put("gas", gasEmergencyNumber);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("emergencyServices", contacts);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/dial-hospital")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> dialHospital(@RequestBody HospitalDialRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            
            User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Send alert to hospitals
            String hospitalEmail = "emergency@cityhospital.com"; // In real app, this would be dynamic
            String userContact = user.getPhoneNumber() != null ? user.getPhoneNumber() : user.getEmail();
            
            emailService.sendHospitalAlert(
                hospitalEmail,
                request.getEmergencyType() + " - " + request.getDescription(),
                request.getLocation(),
                userContact
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hospital alert sent successfully");
            response.put("hospitalNumber", hospitalNumber);
            response.put("estimatedResponse", "5-10 minutes");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/update-contacts")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> updateEmergencyContacts(@RequestBody UpdateContactsRequest request,
                                                   @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            
            User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            user.setEmergencyContact1(request.getContact1());
            user.setEmergencyContact2(request.getContact2());
            user.setEmergencyContact3(request.getContact3());
            
            userService.updateUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Emergency contacts updated successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user-contacts")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> getUserEmergencyContacts(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            
            User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> contacts = new HashMap<>();
            contacts.put("contact1", user.getEmergencyContact1());
            contacts.put("contact2", user.getEmergencyContact2());
            contacts.put("contact3", user.getEmergencyContact3());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("emergencyContacts", contacts);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Request DTOs
    public static class SOSRequest {
        private String message;
        private List<String> emergencyContacts;
        private String name; // For anonymous SOS
        private String phoneNumber; // For anonymous SOS
        private String location;
        private Double latitude;
        private Double longitude;

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<String> getEmergencyContacts() { return emergencyContacts; }
        public void setEmergencyContacts(List<String> emergencyContacts) { this.emergencyContacts = emergencyContacts; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class HospitalDialRequest {
        private String emergencyType;
        private String description;
        private String location;

        public String getEmergencyType() { return emergencyType; }
        public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }

    public static class UpdateContactsRequest {
        private String contact1;
        private String contact2;
        private String contact3;

        public String getContact1() { return contact1; }
        public void setContact1(String contact1) { this.contact1 = contact1; }
        public String getContact2() { return contact2; }
        public void setContact2(String contact2) { this.contact2 = contact2; }
        public String getContact3() { return contact3; }
        public void setContact3(String contact3) { this.contact3 = contact3; }
    }
}