package com.sensesafe.repository;

import com.sensesafe.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    /**
     * Find audit logs by user ID with pagination
     */
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    /**
     * Find audit logs by action type with pagination
     */
    Page<AuditLog> findByActionTypeOrderByCreatedAtDesc(String actionType, Pageable pageable);
    
    /**
     * Find audit logs by status with pagination
     */
    Page<AuditLog> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    /**
     * Find audit logs by target type and target ID
     */
    List<AuditLog> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, String targetId);
    
    /**
     * Find audit logs by blockchain transaction hash
     */
    Optional<AuditLog> findByBlockchainTxHash(String blockchainTxHash);
    
    /**
     * Find audit logs within date range
     */
    @Query("SELECT al FROM AuditLog al WHERE al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate, 
                                   Pageable pageable);
    
    /**
     * Find audit logs by multiple criteria
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "(:actionType IS NULL OR al.actionType = :actionType) AND " +
           "(:userId IS NULL OR al.userId = :userId) AND " +
           "(:status IS NULL OR al.status = :status) AND " +
           "(:startDate IS NULL OR al.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR al.createdAt <= :endDate) " +
           "ORDER BY al.createdAt DESC")
    Page<AuditLog> findByMultipleCriteria(@Param("actionType") String actionType,
                                          @Param("userId") String userId,
                                          @Param("status") String status,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate,
                                          Pageable pageable);
    
    /**
     * Get audit trail for a specific incident (target type = INCIDENT)
     */
    @Query("SELECT al FROM AuditLog al WHERE al.targetType = 'INCIDENT' AND al.targetId = :incidentId ORDER BY al.createdAt ASC")
    List<AuditLog> getIncidentAuditTrail(@Param("incidentId") String incidentId);
    
    /**
     * Get recent audit logs (last N entries)
     */
    @Query("SELECT al FROM AuditLog al ORDER BY al.createdAt DESC")
    List<AuditLog> findRecentLogs(Pageable pageable);
    
    /**
     * Count logs by action type
     */
    @Query("SELECT al.actionType, COUNT(al) FROM AuditLog al GROUP BY al.actionType")
    List<Object[]> countByActionType();
    
    /**
     * Count logs by status
     */
    @Query("SELECT al.status, COUNT(al) FROM AuditLog al GROUP BY al.status")
    List<Object[]> countByStatus();
    
    /**
     * Get audit logs that need blockchain confirmation (status = PENDING)
     */
    @Query("SELECT al FROM AuditLog al WHERE al.blockchainStatus = 'PENDING' ORDER BY al.createdAt DESC")
    List<AuditLog> findPendingBlockchainLogs();
    
    /**
     * Get blockchain statistics
     */
    @Query("SELECT " +
           "COUNT(CASE WHEN al.blockchainStatus = 'CONFIRMED' THEN 1 END) as confirmed, " +
           "COUNT(CASE WHEN al.blockchainStatus = 'PENDING' THEN 1 END) as pending, " +
           "COUNT(CASE WHEN al.blockchainStatus = 'FAILED' THEN 1 END) as failed, " +
           "COUNT(al) as total " +
           "FROM AuditLog al")
    List<Object[]> getBlockchainStatistics();
    
    /**
     * Find logs by user role
     */
    @Query("SELECT al FROM AuditLog al WHERE al.userRole = :userRole ORDER BY al.createdAt DESC")
    List<AuditLog> findByUserRole(@Param("userRole") String userRole, Pageable pageable);
}
