package com.sensesafe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_verifications")
public class IncidentVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    @NotNull
    private Incident incident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verifier_id")
    @NotNull
    private User verifier;

    @Enumerated(EnumType.STRING)
    @NotNull
    private VerificationType verificationType;

    private String comments;
    private Boolean isAccurate;
    private Integer confidenceLevel; // 1-10

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt = LocalDateTime.now();

    public enum VerificationType {
        UPVOTE, FLAG, DETAILED_VERIFICATION, ADMIN_VERIFICATION
    }

    // Constructors
    public IncidentVerification() {}

    public IncidentVerification(Incident incident, User verifier, VerificationType verificationType, Boolean isAccurate) {
        this.incident = incident;
        this.verifier = verifier;
        this.verificationType = verificationType;
        this.isAccurate = isAccurate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Incident getIncident() { return incident; }
    public void setIncident(Incident incident) { this.incident = incident; }

    public User getVerifier() { return verifier; }
    public void setVerifier(User verifier) { this.verifier = verifier; }

    public VerificationType getVerificationType() { return verificationType; }
    public void setVerificationType(VerificationType verificationType) { this.verificationType = verificationType; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Boolean getIsAccurate() { return isAccurate; }
    public void setIsAccurate(Boolean isAccurate) { this.isAccurate = isAccurate; }

    public Integer getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(Integer confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}