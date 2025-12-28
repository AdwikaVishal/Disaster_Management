package com.sensesafe.repository;

import com.sensesafe.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
    
    /**
     * Find system configuration by config key
     * @param configKey the configuration key
     * @return optional system config
     */
    Optional<SystemConfig> findByConfigKey(String configKey);
    
    /**
     * Check if a configuration key exists
     * @param configKey the configuration key
     * @return true if exists, false otherwise
     */
    boolean existsByConfigKey(String configKey);
    
    /**
     * Get all active configurations (enabled = true)
     * @return list of enabled system configurations
     */
    @Query("SELECT sc FROM SystemConfig sc WHERE sc.configValue = true")
    java.util.List<SystemConfig> findEnabledConfigurations();
    
    /**
     * Get configuration with key and value
     * @param configKey the configuration key
     * @param configValue the configuration value
     * @return optional system config
     */
    Optional<SystemConfig> findByConfigKeyAndConfigValue(String configKey, Boolean configValue);
}
