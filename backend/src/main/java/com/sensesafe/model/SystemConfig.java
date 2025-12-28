package com.sensesafe.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
public class SystemConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "config_key", unique = true, nullable = false)
    private String configKey;
    
    @Column(name = "config_value", nullable = false)
    private Boolean configValue;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Default constructor for JPA
    public SystemConfig() {}
    
    // Constructor with parameters
    public SystemConfig(String configKey, Boolean configValue, String description) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }
    
    // PrePersist and PreUpdate callbacks
    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getConfigKey() {
        return configKey;
    }
    
    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }
    
    public Boolean getConfigValue() {
        return configValue;
    }
    
    public void setConfigValue(Boolean configValue) {
        this.configValue = configValue;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper methods
    public boolean isEnabled() {
        return configValue != null && configValue;
    }
    
    public void enable(String updatedBy) {
        this.configValue = true;
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void disable(String updatedBy) {
        this.configValue = false;
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "SystemConfig{" +
                "id=" + id +
                ", configKey='" + configKey + '\'' +
                ", configValue=" + configValue +
                ", description='" + description + '\'' +
                ", updatedBy='" + updatedBy + '\'' +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
