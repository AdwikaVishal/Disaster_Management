-- Create system_config table for emergency system overrides
CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value BOOLEAN NOT NULL,
    description VARCHAR(1000),
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key),
    INDEX idx_config_value (config_value)
);

-- Insert default system configuration values
INSERT INTO system_config (config_key, config_value, description, updated_by) VALUES
('AUTO_DISPATCH_VOLUNTEERS', true, 'Automatically assign tasks based on proximity', 'SYSTEM'),
('AI_RISK_SCORING', true, 'Use ML model for incident triage', 'SYSTEM'),
('LOCKDOWN_MODE', false, 'Restrict user movements suggestions', 'SYSTEM')
ON DUPLICATE KEY UPDATE 
    description = VALUES(description);
