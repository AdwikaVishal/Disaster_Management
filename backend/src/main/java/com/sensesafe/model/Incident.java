package com.sensesafe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "incidents")
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    @Column(length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private IncidentType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Severity severity;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    // Location data
    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String address;
    private String landmark;

    // Reporter information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    // Media attachments
    @ElementCollection
    @CollectionTable(name = "incident_media", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "media_url")
    private Set<String> mediaUrls;

    // Community interaction
    private Integer upvotes = 0;
    private Integer flags = 0;
    private Integer verificationCount = 0;

    // Emergency details
    private Integer injuriesReported = 0;
    private Integer peopleInvolved = 0;
    private Boolean nearSensitiveLocation = false;
    private Double distanceToResponder;

    // ML Analysis results
    private Double fraudProbability;
    private Boolean isFraud = false;
    private Double riskScore;
    private String riskLevel;
    private Double similarityScore;

    // Blockchain
    private String blockchainTxHash;
    private Boolean blockchainVerified = false;

    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // Emergency response
    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<EmergencyResponse> emergencyResponses;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<IncidentVerification> verifications;

    public enum IncidentType {
        FIRE, FLOOD, VIOLENCE, ROAD_ACCIDENT, GAS_LEAK, POWER_OUTAGE, 
        INFRASTRUCTURE_FAILURE, MEDICAL_EMERGENCY, NATURAL_DISASTER, OTHER
    }

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum Status {
        NEW, VERIFIED, IN_PROGRESS, RESOLVED, REJECTED, DUPLICATE
    }

    // Constructors
    public Incident() {}

    public Incident(String title, String description, IncidentType type, Severity severity, 
                   Double latitude, Double longitude, User reporter) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.severity = severity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.reporter = reporter;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IncidentType getType() { return type; }
    public void setType(IncidentType type) { this.type = type; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public Set<String> getMediaUrls() { return mediaUrls; }
    public void setMediaUrls(Set<String> mediaUrls) { this.mediaUrls = mediaUrls; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }

    public Integer getFlags() { return flags; }
    public void setFlags(Integer flags) { this.flags = flags; }

    public Integer getVerificationCount() { return verificationCount; }
    public void setVerificationCount(Integer verificationCount) { this.verificationCount = verificationCount; }

    public Integer getInjuriesReported() { return injuriesReported; }
    public void setInjuriesReported(Integer injuriesReported) { this.injuriesReported = injuriesReported; }

    public Integer getPeopleInvolved() { return peopleInvolved; }
    public void setPeopleInvolved(Integer peopleInvolved) { this.peopleInvolved = peopleInvolved; }

    public Boolean getNearSensitiveLocation() { return nearSensitiveLocation; }
    public void setNearSensitiveLocation(Boolean nearSensitiveLocation) { this.nearSensitiveLocation = nearSensitiveLocation; }

    public Double getDistanceToResponder() { return distanceToResponder; }
    public void setDistanceToResponder(Double distanceToResponder) { this.distanceToResponder = distanceToResponder; }

    public Double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(Double fraudProbability) { this.fraudProbability = fraudProbability; }

    public Boolean getIsFraud() { return isFraud; }
    public void setIsFraud(Boolean isFraud) { this.isFraud = isFraud; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public String getBlockchainTxHash() { return blockchainTxHash; }
    public void setBlockchainTxHash(String blockchainTxHash) { this.blockchainTxHash = blockchainTxHash; }

    public Boolean getBlockchainVerified() { return blockchainVerified; }
    public void setBlockchainVerified(Boolean blockchainVerified) { this.blockchainVerified = blockchainVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public Set<EmergencyResponse> getEmergencyResponses() { return emergencyResponses; }
    public void setEmergencyResponses(Set<EmergencyResponse> emergencyResponses) { this.emergencyResponses = emergencyResponses; }

    public Set<IncidentVerification> getVerifications() { return verifications; }
    public void setVerifications(Set<IncidentVerification> verifications) { this.verifications = verifications; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}