-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(50),
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    target_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    blockchain_tx_hash VARCHAR(66) UNIQUE,
    blockchain_status VARCHAR(20),
    blockchain_network VARCHAR(50),
    blockchain_gas_used BIGINT,
    blockchain_block_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT,
    
    INDEX idx_audit_timestamp (created_at),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_blockchain (blockchain_tx_hash),
    INDEX idx_audit_status (status),
    INDEX idx_audit_target (target_type, target_id)
);

-- Insert some sample audit logs for testing
INSERT INTO audit_logs (action_type, user_id, user_role, target_type, target_id, target_description, status, blockchain_status, blockchain_tx_hash) VALUES
('USER_LOGIN', 'admin-01', 'ADMIN', 'USER', 'admin-01', 'Admin user login', 'SUCCESS', 'CONFIRMED', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
('INCIDENT_REPORTED', 'user-123', 'USER', 'INCIDENT', 'INC-1001', 'Fire incident reported in downtown area', 'SUCCESS', 'CONFIRMED', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
('INCIDENT_VERIFIED', 'admin-01', 'ADMIN', 'INCIDENT', 'INC-1001', 'Incident verified as legitimate fire', 'SUCCESS', 'CONFIRMED', '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'),
('RESOURCE_ASSIGNED', 'admin-01', 'ADMIN', 'INCIDENT', 'INC-1001', 'Fire Brigade Unit 3 assigned', 'SUCCESS', 'PENDING', '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'),
('INCIDENT_RESOLVED', 'admin-01', 'ADMIN', 'INCIDENT', 'INC-1001', 'Fire incident successfully resolved', 'SUCCESS', 'PENDING', NULL),
('VOLUNTEER_APPROVED', 'admin-01', 'ADMIN', 'VOLUNTEER', 'VOL-2001', 'Volunteer John Doe approved', 'SUCCESS', 'CONFIRMED', '0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'),
('USER_REGISTRATION', 'user-456', 'USER', 'USER', 'user-456', 'New user registration', 'SUCCESS', 'CONFIRMED', '0x2233445566778899aabbccddeeff00112233445566778899aabbccddeeff00'),
('ALERT_BROADCAST', 'System', 'SYSTEM', 'REGION', 'REGION-4', 'Emergency alert broadcast to Region 4', 'SUCCESS', 'CONFIRMED', '0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff0011');
