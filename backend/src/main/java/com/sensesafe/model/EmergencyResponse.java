package com.sensesafe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_responses")
public class EmergencyResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    @NotNull
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @NotNull
    private ResponseType responseType;

    @Enumerated(EnumType.STRING)
    private ResponseStatus status = ResponseStatus.DISPATCHED;

    private String resourceId;
    private String contactNumber;
    private String notes;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt = LocalDateTime.now();

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    private Integer estimatedArrivalMinutes;
    private Double distanceKm;

    public enum ResponseType {
        FIRE_BRIGADE, AMBULANCE, POLICE, RESCUE_TEAM, 
        GAS_EMERGENCY, HOSPITAL, VOLUNTEER_TEAM
    }

    public enum ResponseStatus {
        DISPATCHED, EN_ROUTE, ARRIVED, COMPLETED, CANCELLED
    }

    // Constructors
    public EmergencyResponse() {}

    public EmergencyResponse(Incident incident, ResponseType responseType, String resourceId) {
        this.incident = incident;
        this.responseType = responseType;
        this.resourceId = resourceId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Incident getIncident() { return incident; }
    public void setIncident(Incident incident) { this.incident = incident; }

    public ResponseType getResponseType() { return responseType; }
    public void setResponseType(ResponseType responseType) { this.responseType = responseType; }

    public ResponseStatus getStatus() { return status; }
    public void setStatus(ResponseStatus status) { this.status = status; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public LocalDateTime getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(LocalDateTime arrivedAt) { this.arrivedAt = arrivedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Integer getEstimatedArrivalMinutes() { return estimatedArrivalMinutes; }
    public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) { this.estimatedArrivalMinutes = estimatedArrivalMinutes; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
}