package com.sensesafe.service;

import com.sensesafe.model.User;
import com.sensesafe.model.VolunteerApplication;
import com.sensesafe.repository.VolunteerApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class VolunteerService {

    @Autowired
    private VolunteerApplicationRepository volunteerApplicationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    public VolunteerApplication submitApplication(VolunteerApplication application) {
        // Check if user already has a pending or approved application
        Optional<VolunteerApplication> existingApp = volunteerApplicationRepository
            .findByUserIdAndStatus(application.getUser().getId(), 
                                 VolunteerApplication.ApplicationStatus.PENDING);
        
        if (existingApp.isPresent()) {
            throw new RuntimeException("You already have a pending volunteer application");
        }

        Optional<VolunteerApplication> approvedApp = volunteerApplicationRepository
            .findByUserIdAndStatus(application.getUser().getId(), 
                                 VolunteerApplication.ApplicationStatus.APPROVED);
        
        if (approvedApp.isPresent()) {
            throw new RuntimeException("You are already an approved volunteer");
        }

        application.setCreatedAt(LocalDateTime.now());
        application.setStatus(VolunteerApplication.ApplicationStatus.PENDING);
        
        return volunteerApplicationRepository.save(application);
    }

    public List<VolunteerApplication> getAllApplications() {
        return volunteerApplicationRepository.findAll();
    }

    public List<VolunteerApplication> getPendingApplications() {
        return volunteerApplicationRepository.findPendingApplicationsOrderByDate();
    }

    public List<VolunteerApplication> getApplicationsByStatus(VolunteerApplication.ApplicationStatus status) {
        return volunteerApplicationRepository.findByStatus(status);
    }

    public List<VolunteerApplication> getApplicationsByType(VolunteerApplication.VolunteerType type) {
        return volunteerApplicationRepository.findByVolunteerType(type);
    }

    public List<VolunteerApplication> getUserApplications(Long userId) {
        return volunteerApplicationRepository.findByUserId(userId);
    }

    public Optional<VolunteerApplication> getApplicationById(Long id) {
        return volunteerApplicationRepository.findById(id);
    }

    public VolunteerApplication reviewApplication(Long applicationId, 
                                                VolunteerApplication.ApplicationStatus decision,
                                                String reviewNotes, 
                                                Long reviewerId) {
        VolunteerApplication application = volunteerApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        User reviewer = userService.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        application.setStatus(decision);
        application.setReviewNotes(reviewNotes);
        application.setReviewedBy(reviewer);
        application.setReviewedAt(LocalDateTime.now());

        VolunteerApplication updatedApplication = volunteerApplicationRepository.save(application);

        // Update user role if approved
        if (decision == VolunteerApplication.ApplicationStatus.APPROVED) {
            User user = application.getUser();
            user.setRole(User.Role.VOLUNTEER);
            userService.updateUser(user);
        }

        // Send notification email
        sendApplicationStatusEmail(application, decision);

        return updatedApplication;
    }

    public List<VolunteerApplication> findVolunteersInArea(Double latitude, Double longitude) {
        return volunteerApplicationRepository.findApprovedVolunteersWithinArea(latitude, longitude);
    }

    public List<VolunteerApplication> findVolunteersByType(VolunteerApplication.VolunteerType type) {
        return volunteerApplicationRepository.findApprovedVolunteersByType(type);
    }

    public Map<String, Object> getVolunteerStatistics(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        
        Long totalApplications = volunteerApplicationRepository.countApplicationsAfter(since);
        List<Object[]> statusStats = volunteerApplicationRepository.getApplicationStatusStatistics();
        List<Object[]> typeStats = volunteerApplicationRepository.getVolunteerTypeStatistics();
        
        return Map.of(
            "totalApplications", totalApplications,
            "statusStatistics", statusStats,
            "typeStatistics", typeStats,
            "period", days + " days"
        );
    }

    public VolunteerApplication updateApplication(Long applicationId, VolunteerApplication updatedApplication) {
        VolunteerApplication existing = volunteerApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        // Only allow updates if application is pending
        if (existing.getStatus() != VolunteerApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Cannot update application that has been reviewed");
        }

        existing.setMotivation(updatedApplication.getMotivation());
        existing.setSkills(updatedApplication.getSkills());
        existing.setAvailability(updatedApplication.getAvailability());
        existing.setExperience(updatedApplication.getExperience());
        existing.setCertifications(updatedApplication.getCertifications());
        existing.setEmergencyTraining(updatedApplication.getEmergencyTraining());
        existing.setVolunteerType(updatedApplication.getVolunteerType());
        existing.setPreferredLatitude(updatedApplication.getPreferredLatitude());
        existing.setPreferredLongitude(updatedApplication.getPreferredLongitude());
        existing.setMaxDistanceKm(updatedApplication.getMaxDistanceKm());
        existing.setAlternatePhone(updatedApplication.getAlternatePhone());
        existing.setEmergencyContact(updatedApplication.getEmergencyContact());

        return volunteerApplicationRepository.save(existing);
    }

    public void deleteApplication(Long applicationId, Long userId) {
        VolunteerApplication application = volunteerApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        // Only allow deletion by the applicant and only if pending
        if (!application.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own application");
        }

        if (application.getStatus() != VolunteerApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Cannot delete application that has been reviewed");
        }

        volunteerApplicationRepository.delete(application);
    }

    private void sendApplicationStatusEmail(VolunteerApplication application, 
                                          VolunteerApplication.ApplicationStatus status) {
        User user = application.getUser();
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            emailService.sendVolunteerApplicationUpdate(
                user.getEmail(),
                user.getFirstName(),
                status.name(),
                application.getReviewNotes()
            );
        }
    }

    public Long getActiveVolunteerCount() {
        return (long) volunteerApplicationRepository
            .findByStatus(VolunteerApplication.ApplicationStatus.APPROVED).size();
    }

    public Long getPendingApplicationCount() {
        return (long) volunteerApplicationRepository
            .findByStatus(VolunteerApplication.ApplicationStatus.PENDING).size();
    }
}