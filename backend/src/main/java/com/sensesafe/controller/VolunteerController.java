package com.sensesafe.controller;

import com.sensesafe.model.User;
import com.sensesafe.model.VolunteerApplication;
import com.sensesafe.security.JwtUtil;
import com.sensesafe.service.UserService;
import com.sensesafe.service.VolunteerService;
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
@RequestMapping("/volunteers")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> submitApplication(@Valid @RequestBody VolunteerApplicationRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            VolunteerApplication application = new VolunteerApplication(
                    user,
                    request.getMotivation(),
                    request.getSkills(),
                    request.getAvailability(),
                    request.getVolunteerType());

            if (request.getExperience() != null) {
                application.setExperience(request.getExperience());
            }
            if (request.getCertifications() != null) {
                application.setCertifications(request.getCertifications());
            }
            if (request.getEmergencyTraining() != null) {
                application.setEmergencyTraining(request.getEmergencyTraining());
            }
            if (request.getPreferredLatitude() != null) {
                application.setPreferredLatitude(request.getPreferredLatitude());
            }
            if (request.getPreferredLongitude() != null) {
                application.setPreferredLongitude(request.getPreferredLongitude());
            }
            if (request.getMaxDistanceKm() != null) {
                application.setMaxDistanceKm(request.getMaxDistanceKm());
            }
            if (request.getAlternatePhone() != null) {
                application.setAlternatePhone(request.getAlternatePhone());
            }
            if (request.getEmergencyContact() != null) {
                application.setEmergencyContact(request.getEmergencyContact());
            }

            VolunteerApplication savedApplication = volunteerService.submitApplication(application);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Volunteer application submitted successfully");
            response.put("application", createApplicationResponse(savedApplication));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllApplications(@RequestParam(required = false) String status) {
        try {
            List<VolunteerApplication> applications;

            if (status != null) {
                VolunteerApplication.ApplicationStatus statusEnum = VolunteerApplication.ApplicationStatus
                        .valueOf(status.toUpperCase());
                applications = volunteerService.getApplicationsByStatus(statusEnum);
            } else {
                applications = volunteerService.getAllApplications();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applications.stream().map(this::createApplicationResponse).toList());
            response.put("total", applications.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/applications/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingApplications() {
        try {
            List<VolunteerApplication> applications = volunteerService.getPendingApplications();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applications.stream().map(this::createApplicationResponse).toList());
            response.put("total", applications.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/applications/my")
    @PreAuthorize("hasAnyRole('USER', 'VOLUNTEER')")
    public ResponseEntity<?> getMyApplications(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            List<VolunteerApplication> applications = volunteerService.getUserApplications(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applications.stream().map(this::createApplicationResponse).toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getApplication(@PathVariable Long id) {
        try {
            Optional<VolunteerApplication> application = volunteerService.getApplicationById(id);

            if (application.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Application not found");
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("application", createApplicationResponse(application.get()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/applications/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewApplication(@PathVariable Long id,
            @RequestBody ReviewApplicationRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long reviewerId = jwtUtil.extractUserId(token);

            VolunteerApplication.ApplicationStatus decision = VolunteerApplication.ApplicationStatus
                    .valueOf(request.getDecision().toUpperCase());

            VolunteerApplication reviewedApplication = volunteerService.reviewApplication(
                    id, decision, request.getReviewNotes(), reviewerId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Application reviewed successfully");
            response.put("application", createApplicationResponse(reviewedApplication));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> getNearbyVolunteers(@RequestParam Double latitude,
            @RequestParam Double longitude) {
        try {
            List<VolunteerApplication> volunteers = volunteerService.findVolunteersInArea(latitude, longitude);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("volunteers", volunteers.stream().map(this::createApplicationResponse).toList());
            response.put("total", volunteers.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/by-type")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<?> getVolunteersByType(@RequestParam String type) {
        try {
            VolunteerApplication.VolunteerType volunteerType = VolunteerApplication.VolunteerType
                    .valueOf(type.toUpperCase());

            List<VolunteerApplication> volunteers = volunteerService.findVolunteersByType(volunteerType);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("volunteers", volunteers.stream().map(this::createApplicationResponse).toList());
            response.put("type", type);

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
    public ResponseEntity<?> getVolunteerStatistics(@RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> statistics = volunteerService.getVolunteerStatistics(days);

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

    @PutMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('USER', 'VOLUNTEER')")
    public ResponseEntity<?> updateApplication(@PathVariable Long id,
            @RequestBody VolunteerApplicationRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            VolunteerApplication updatedApplication = new VolunteerApplication();
            updatedApplication.setMotivation(request.getMotivation());
            updatedApplication.setSkills(request.getSkills());
            updatedApplication.setAvailability(request.getAvailability());
            updatedApplication.setExperience(request.getExperience());
            updatedApplication.setCertifications(request.getCertifications());
            updatedApplication.setEmergencyTraining(request.getEmergencyTraining());
            updatedApplication.setVolunteerType(request.getVolunteerType());
            updatedApplication.setPreferredLatitude(request.getPreferredLatitude());
            updatedApplication.setPreferredLongitude(request.getPreferredLongitude());
            updatedApplication.setMaxDistanceKm(request.getMaxDistanceKm());
            updatedApplication.setAlternatePhone(request.getAlternatePhone());
            updatedApplication.setEmergencyContact(request.getEmergencyContact());

            VolunteerApplication savedApplication = volunteerService.updateApplication(id, updatedApplication);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Application updated successfully");
            response.put("application", createApplicationResponse(savedApplication));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('USER', 'VOLUNTEER')")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            volunteerService.deleteApplication(id, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Application deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Map<String, Object> createApplicationResponse(VolunteerApplication application) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", application.getId());
        response.put("motivation", application.getMotivation());
        response.put("skills", application.getSkills());
        response.put("availability", application.getAvailability());
        response.put("experience", application.getExperience());
        response.put("certifications", application.getCertifications());
        response.put("emergencyTraining", application.getEmergencyTraining());
        response.put("status", application.getStatus().name());
        response.put("volunteerType", application.getVolunteerType().name());
        response.put("preferredLatitude", application.getPreferredLatitude());
        response.put("preferredLongitude", application.getPreferredLongitude());
        response.put("maxDistanceKm", application.getMaxDistanceKm());
        response.put("alternatePhone", application.getAlternatePhone());
        response.put("emergencyContact", application.getEmergencyContact());
        response.put("createdAt", application.getCreatedAt());
        response.put("reviewedAt", application.getReviewedAt());
        response.put("reviewNotes", application.getReviewNotes());

        if (application.getUser() != null) {
            Map<String, Object> user = new HashMap<>();
            user.put("id", application.getUser().getId());
            user.put("username", application.getUser().getUsername());
            user.put("firstName", application.getUser().getFirstName());
            user.put("lastName", application.getUser().getLastName());
            user.put("email", application.getUser().getEmail());
            user.put("phoneNumber", application.getUser().getPhoneNumber());
            user.put("trustScore", application.getUser().getTrustScore());
            response.put("user", user);
        }

        if (application.getReviewedBy() != null) {
            Map<String, Object> reviewer = new HashMap<>();
            reviewer.put("id", application.getReviewedBy().getId());
            reviewer.put("username", application.getReviewedBy().getUsername());
            reviewer.put("firstName", application.getReviewedBy().getFirstName());
            reviewer.put("lastName", application.getReviewedBy().getLastName());
            response.put("reviewedBy", reviewer);
        }

        return response;
    }

    // Request DTOs
    public static class VolunteerApplicationRequest {
        private String motivation;
        private String skills;
        private String availability;
        private String experience;
        private String certifications;
        private String emergencyTraining;
        private VolunteerApplication.VolunteerType volunteerType;
        private Double preferredLatitude;
        private Double preferredLongitude;
        private Double maxDistanceKm;
        private String alternatePhone;
        private String emergencyContact;

        // Getters and setters
        public String getMotivation() {
            return motivation;
        }

        public void setMotivation(String motivation) {
            this.motivation = motivation;
        }

        public String getSkills() {
            return skills;
        }

        public void setSkills(String skills) {
            this.skills = skills;
        }

        public String getAvailability() {
            return availability;
        }

        public void setAvailability(String availability) {
            this.availability = availability;
        }

        public String getExperience() {
            return experience;
        }

        public void setExperience(String experience) {
            this.experience = experience;
        }

        public String getCertifications() {
            return certifications;
        }

        public void setCertifications(String certifications) {
            this.certifications = certifications;
        }

        public String getEmergencyTraining() {
            return emergencyTraining;
        }

        public void setEmergencyTraining(String emergencyTraining) {
            this.emergencyTraining = emergencyTraining;
        }

        public VolunteerApplication.VolunteerType getVolunteerType() {
            return volunteerType;
        }

        public void setVolunteerType(VolunteerApplication.VolunteerType volunteerType) {
            this.volunteerType = volunteerType;
        }

        public Double getPreferredLatitude() {
            return preferredLatitude;
        }

        public void setPreferredLatitude(Double preferredLatitude) {
            this.preferredLatitude = preferredLatitude;
        }

        public Double getPreferredLongitude() {
            return preferredLongitude;
        }

        public void setPreferredLongitude(Double preferredLongitude) {
            this.preferredLongitude = preferredLongitude;
        }

        public Double getMaxDistanceKm() {
            return maxDistanceKm;
        }

        public void setMaxDistanceKm(Double maxDistanceKm) {
            this.maxDistanceKm = maxDistanceKm;
        }

        public String getAlternatePhone() {
            return alternatePhone;
        }

        public void setAlternatePhone(String alternatePhone) {
            this.alternatePhone = alternatePhone;
        }

        public String getEmergencyContact() {
            return emergencyContact;
        }

        public void setEmergencyContact(String emergencyContact) {
            this.emergencyContact = emergencyContact;
        }
    }

    public static class ReviewApplicationRequest {
        private String decision;
        private String reviewNotes;

        public String getDecision() {
            return decision;
        }

        public void setDecision(String decision) {
            this.decision = decision;
        }

        public String getReviewNotes() {
            return reviewNotes;
        }

        public void setReviewNotes(String reviewNotes) {
            this.reviewNotes = reviewNotes;
        }
    }
}