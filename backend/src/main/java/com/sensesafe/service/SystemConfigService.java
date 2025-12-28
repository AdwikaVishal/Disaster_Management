package com.sensesafe.service;

import com.sensesafe.model.SystemConfig;
import com.sensesafe.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class SystemConfigService {
    
    @Autowired
    private SystemConfigRepository systemConfigRepository;
    
    @Autowired
    private AuditLogService auditLogService;
    
    // Configuration keys
    public static final String AUTO_DISPATCH_VOLUNTEERS = "AUTO_DISPATCH_VOLUNTEERS";
    public static final String AI_RISK_SCORING = "AI_RISK_SCORING";
    public static final String LOCKDOWN_MODE = "LOCKDOWN_MODE";
    
    /**
     * Get all system configurations
     * @return map of configuration key to SystemConfig
     */
    public Map<String, SystemConfig> getAllConfigurations() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        Map<String, SystemConfig> configMap = new HashMap<>();
        
        for (SystemConfig config : configs) {
            configMap.put(config.getConfigKey(), config);
        }
        
        return configMap;
    }
    
    /**
     * Get a specific configuration by key
     * @param configKey the configuration key
     * @return optional SystemConfig
     */
    public Optional<SystemConfig> getConfiguration(String configKey) {
        return systemConfigRepository.findByConfigKey(configKey);
    }
    
    /**
     * Get configuration value as boolean
     * @param configKey the configuration key
     * @return boolean value (false if not found)
     */
    public boolean isEnabled(String configKey) {
        Optional<SystemConfig> config = systemConfigRepository.findByConfigKey(configKey);
        return config.map(SystemConfig::isEnabled).orElse(false);
    }
    
    /**
     * Update configuration value
     * @param configKey the configuration key
     * @param enabled the new value
     * @param updatedBy the user who made the change
     * @return the updated SystemConfig
     */
    public SystemConfig updateConfiguration(String configKey, boolean enabled, String updatedBy) {
        Optional<SystemConfig> existingConfig = systemConfigRepository.findByConfigKey(configKey);
        
        SystemConfig config;
        boolean wasEnabled = false;
        
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
            wasEnabled = config.isEnabled();
            config.setConfigValue(enabled);
            config.setUpdatedBy(updatedBy);
            config.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new configuration if it doesn't exist
            String description = getDescriptionForKey(configKey);
            config = new SystemConfig(configKey, enabled, description);
            config.setUpdatedBy(updatedBy);
        }
        
        SystemConfig savedConfig = systemConfigRepository.save(config);
        
        // Log configuration change in audit log
        String action = enabled ? "SYSTEM_CONFIG_ENABLED" : "SYSTEM_CONFIG_DISABLED";
        String description = String.format("System override '%s' %s by %s", 
                configKey, enabled ? "enabled" : "disabled", updatedBy);
        
        auditLogService.logAction(
            action,
            updatedBy,
            "ADMIN",
            "SYSTEM_CONFIG",
            configKey,
            description,
            null, // IP address would be set by controller
            null, // User agent would be set by controller
            "SUCCESS",
            null
        );
        
        return savedConfig;
    }
    
    /**
     * Initialize default system configurations
     */
    public void initializeDefaultConfigurations() {
        initializeConfiguration(AUTO_DISPATCH_VOLUNTEERS, true, 
                "Automatically assign tasks based on proximity");
        initializeConfiguration(AI_RISK_SCORING, true, 
                "Use ML model for incident triage");
        initializeConfiguration(LOCKDOWN_MODE, false, 
                "Restrict user movements suggestions");
    }
    
    /**
     * Initialize a single configuration if it doesn't exist
     */
    private void initializeConfiguration(String configKey, boolean defaultValue, String description) {
        if (!systemConfigRepository.existsByConfigKey(configKey)) {
            SystemConfig config = new SystemConfig(configKey, defaultValue, description);
            config.setUpdatedBy("SYSTEM");
            systemConfigRepository.save(config);
        }
    }
    
    /**
     * Get configuration status for emergency control dashboard
     * @return map of configuration key to status information
     */
    public Map<String, Object> getEmergencyControlStatus() {
        Map<String, Object> status = new HashMap<>();
        
        Map<String, SystemConfig> configs = getAllConfigurations();
        
        status.put("autoDispatchVolunteers", Map.of(
                "enabled", isEnabled(AUTO_DISPATCH_VOLUNTEERS),
                "description", "Automatically assign tasks based on proximity",
                "key", AUTO_DISPATCH_VOLUNTEERS
        ));
        
        status.put("aiRiskScoring", Map.of(
                "enabled", isEnabled(AI_RISK_SCORING),
                "description", "Use ML model for incident triage",
                "key", AI_RISK_SCORING
        ));
        
        status.put("lockdownMode", Map.of(
                "enabled", isEnabled(LOCKDOWN_MODE),
                "description", "Restrict user movements suggestions",
                "key", LOCKDOWN_MODE
        ));
        
        return status;
    }
    
    /**
     * Check if system is in lockdown mode
     * @return true if lockdown mode is enabled
     */
    public boolean isLockdownModeEnabled() {
        return isEnabled(LOCKDOWN_MODE);
    }
    
    /**
     * Check if auto-dispatch is enabled
     * @return true if auto-dispatch is enabled
     */
    public boolean isAutoDispatchEnabled() {
        return isEnabled(AUTO_DISPATCH_VOLUNTEERS);
    }
    
    /**
     * Check if AI risk scoring is enabled
     * @return true if AI risk scoring is enabled
     */
    public boolean isAiRiskScoringEnabled() {
        return isEnabled(AI_RISK_SCORING);
    }
    
    /**
     * Get description for configuration key
     */
    private String getDescriptionForKey(String configKey) {
        return switch (configKey) {
            case AUTO_DISPATCH_VOLUNTEERS -> "Automatically assign tasks based on proximity";
            case AI_RISK_SCORING -> "Use ML model for incident triage";
            case LOCKDOWN_MODE -> "Restrict user movements suggestions";
            default -> "System configuration";
        };
    }
}
