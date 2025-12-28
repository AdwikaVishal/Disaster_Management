package com.sensesafe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "created_at"),
    @Index(name = "idx_audit_action", columnList = "action_type"),
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_blockchain", columnList = "blockchain_tx_hash")
})
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Size(max = 100)
    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType;
    
    @NotNull
    @Size(max = 50)
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;
    
    @Column(name = "user_role")
    @Size(max = 50)
    private String userRole;
    
    @Column(name = "target_type")
    @Size(max = 50)
    private String targetType;
    
    @Column(name = "target_id")
    @Size(max = 100)
    private String targetId;
    
    @Column(name = "target_description", columnDefinition = "TEXT")
    private String targetDescription;
    
    @Column(name = "ip_address")
    @Size(max = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "status", nullable = false)
    @Size(max = 20)
    private String status; // SUCCESS, FAILED, PENDING
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "blockchain_tx_hash", unique = true)
    @Size(max = 66)
    private String blockchainTxHash;
    
    @Column(name = "blockchain_status")
    @Size(max = 20)
    private String blockchainStatus; // PENDING, CONFIRMED, FAILED
    
    @Column(name = "blockchain_network")
    @Size(max = 50)
    private String blockchainNetwork;
    
    @Column(name = "blockchain_gas_used")
    private Long blockchainGasUsed;
    
    @Column(name = "blockchain_block_number")
    private Long blockchainBlockNumber;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string for additional data
    
    // Constructors
    public AuditLog() {}
    
    public AuditLog(String actionType, String userId, String userRole, String status) {
        this.actionType = actionType;
        this.userId = userId;
        this.userRole = userRole;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getActionType() {
        return actionType;
    }
    
    public void setActionType(String actionType) {
        this.actionType = actionType;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUserRole() {
        return userRole;
    }
    
    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
    
    public String getTargetType() {
        return targetType;
    }
    
    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }
    
    public String getTargetId() {
        return targetId;
    }
    
    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }
    
    public String getTargetDescription() {
        return targetDescription;
    }
    
    public void setTargetDescription(String targetDescription) {
        this.targetDescription = targetDescription;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getBlockchainTxHash() {
        return blockchainTxHash;
    }
    
    public void setBlockchainTxHash(String blockchainTxHash) {
        this.blockchainTxHash = blockchainTxHash;
    }
    
    public String getBlockchainStatus() {
        return blockchainStatus;
    }
    
    public void setBlockchainStatus(String blockchainStatus) {
        this.blockchainStatus = blockchainStatus;
    }
    
    public String getBlockchainNetwork() {
        return blockchainNetwork;
    }
    
    public void setBlockchainNetwork(String blockchainNetwork) {
        this.blockchainNetwork = blockchainNetwork;
    }
    
    public Long getBlockchainGasUsed() {
        return blockchainGasUsed;
    }
    
    public void setBlockchainGasUsed(Long blockchainGasUsed) {
        this.blockchainGasUsed = blockchainGasUsed;
    }
    
    public Long getBlockchainBlockNumber() {
        return blockchainBlockNumber;
    }
    
    public void setBlockchainBlockNumber(Long blockchainBlockNumber) {
        this.blockchainBlockNumber = blockchainBlockNumber;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
