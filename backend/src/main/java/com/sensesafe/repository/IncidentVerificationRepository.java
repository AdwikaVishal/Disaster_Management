package com.sensesafe.repository;

import com.sensesafe.model.IncidentVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentVerificationRepository extends JpaRepository<IncidentVerification, Long> {
    
    List<IncidentVerification> findByIncidentId(Long incidentId);
    
    List<IncidentVerification> findByVerifierId(Long verifierId);
    
    List<IncidentVerification> findByVerificationType(IncidentVerification.VerificationType verificationType);
    
    Optional<IncidentVerification> findByIncidentIdAndVerifierId(Long incidentId, Long verifierId);
    
    @Query("SELECT iv FROM IncidentVerification iv WHERE iv.incident.id = :incidentId AND iv.verificationType = :type")
    List<IncidentVerification> findByIncidentIdAndType(@Param("incidentId") Long incidentId, 
                                                      @Param("type") IncidentVerification.VerificationType type);
    
    @Query("SELECT COUNT(iv) FROM IncidentVerification iv WHERE iv.incident.id = :incidentId AND iv.verificationType = 'UPVOTE'")
    Long countUpvotesByIncidentId(@Param("incidentId") Long incidentId);
    
    @Query("SELECT COUNT(iv) FROM IncidentVerification iv WHERE iv.incident.id = :incidentId AND iv.verificationType = 'FLAG'")
    Long countFlagsByIncidentId(@Param("incidentId") Long incidentId);
    
    @Query("SELECT COUNT(iv) FROM IncidentVerification iv WHERE iv.verifiedAt >= :startDate")
    Long countVerificationsAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT iv.verificationType, COUNT(iv) FROM IncidentVerification iv WHERE iv.verifiedAt >= :startDate GROUP BY iv.verificationType")
    List<Object[]> getVerificationTypeStatistics(@Param("startDate") LocalDateTime startDate);
}