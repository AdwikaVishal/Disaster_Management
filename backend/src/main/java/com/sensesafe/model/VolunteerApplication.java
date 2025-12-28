package com.sensesafe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_applications")
public class VolunteerApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @NotNull
    private User user;

    @NotBlank
    private String motivation;

    @NotBlank
    private String skills;

    @NotBlank
    private String availability;

    private String experience;
    private String certifications;
    private String emergencyTraining;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private VolunteerType volunteerType;

    // Location preferences
    private Double preferredLatitude;
    private Double preferredLongitude;
    private Double maxDistanceKm = 50.0;

    // Contact information
    private String alternatePhone;
    private String emergencyContact;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    public enum ApplicationStatus {
        PENDING, APPROVED, REJECTED, UNDER_REVIEW
    }

    public enum VolunteerType {
        MEDICAL_AID, RESCUE_OPERATIONS, RESOURCE_DISTRIBUTION, 
        COMMUNICATION, LOGISTICS, GENERAL_SUPPORT
    }

    // Constructors
    public VolunteerApplication() {}

    public VolunteerApplication(User user, String motivation, String skills, 
                              String availability, VolunteerType volunteerType) {
        this.user = user;
        this.motivation = motivation;
        this.skills = skills;
        this.availability = availability;
        this.volunteerType = volunteerType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getEmergencyTraining() { return emergencyTraining; }
    public void setEmergencyTraining(String emergencyTraining) { this.emergencyTraining = emergencyTraining; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public VolunteerType getVolunteerType() { return volunteerType; }
    public void setVolunteerType(VolunteerType volunteerType) { this.volunteerType = volunteerType; }

    public Double getPreferredLatitude() { return preferredLatitude; }
    public void setPreferredLatitude(Double preferredLatitude) { this.preferredLatitude = preferredLatitude; }

    public Double getPreferredLongitude() { return preferredLongitude; }
    public void setPreferredLongitude(Double preferredLongitude) { this.preferredLongitude = preferredLongitude; }

    public Double getMaxDistanceKm() { return maxDistanceKm; }
    public void setMaxDistanceKm(Double maxDistanceKm) { this.maxDistanceKm = maxDistanceKm; }

    public String getAlternatePhone() { return alternatePhone; }
    public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
}