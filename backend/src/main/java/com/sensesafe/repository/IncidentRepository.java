package com.sensesafe.repository;

import com.sensesafe.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    
    List<Incident> findByStatus(Incident.Status status);
    
    List<Incident> findByType(Incident.IncidentType type);
    
    List<Incident> findBySeverity(Incident.Severity severity);
    
    List<Incident> findByReporterId(Long reporterId);
    
    @Query("SELECT i FROM Incident i WHERE i.createdAt >= :startDate ORDER BY i.createdAt DESC")
    List<Incident> findRecentIncidents(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT i FROM Incident i WHERE i.status IN :statuses ORDER BY i.createdAt DESC")
    List<Incident> findByStatusIn(@Param("statuses") List<Incident.Status> statuses);
    
    @Query("SELECT i FROM Incident i WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(i.latitude)) * " +
           "cos(radians(i.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(i.latitude)))) <= :radiusKm " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(i.latitude)) * " +
           "cos(radians(i.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(i.latitude))))")
    List<Incident> findIncidentsWithinRadius(@Param("lat") Double latitude, 
                                            @Param("lng") Double longitude, 
                                            @Param("radiusKm") Double radiusKm);
    
    @Query("SELECT i FROM Incident i WHERE i.status = :status AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(i.latitude)) * " +
           "cos(radians(i.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(i.latitude)))) <= :radiusKm")
    List<Incident> findActiveIncidentsWithinRadius(@Param("lat") Double latitude, 
                                                  @Param("lng") Double longitude, 
                                                  @Param("radiusKm") Double radiusKm,
                                                  @Param("status") Incident.Status status);
    
    @Query("SELECT i FROM Incident i WHERE i.severity = 'CRITICAL' AND i.status IN ('NEW', 'VERIFIED', 'IN_PROGRESS') " +
           "ORDER BY i.createdAt DESC")
    List<Incident> findCriticalActiveIncidents();
    
    @Query("SELECT i FROM Incident i WHERE i.riskScore >= :minRiskScore ORDER BY i.riskScore DESC")
    List<Incident> findHighRiskIncidents(@Param("minRiskScore") Double minRiskScore);
    
    @Query("SELECT i FROM Incident i WHERE i.fraudProbability >= :threshold")
    List<Incident> findPotentialFraudIncidents(@Param("threshold") Double threshold);
    
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.createdAt >= :startDate")
    Long countIncidentsAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT i.type, COUNT(i) FROM Incident i WHERE i.createdAt >= :startDate GROUP BY i.type")
    List<Object[]> getIncidentTypeStatistics(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT i.severity, COUNT(i) FROM Incident i WHERE i.createdAt >= :startDate GROUP BY i.severity")
    List<Object[]> getIncidentSeverityStatistics(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT i FROM Incident i WHERE i.similarityScore >= :threshold AND i.id != :excludeId")
    List<Incident> findSimilarIncidents(@Param("threshold") Double threshold, @Param("excludeId") Long excludeId);
    
    @Query("SELECT i FROM Incident i WHERE i.blockchainVerified = false AND i.status = 'VERIFIED'")
    List<Incident> findUnverifiedOnBlockchain();
    
    @Query("SELECT i FROM Incident i WHERE i.createdAt BETWEEN :start AND :end ORDER BY i.createdAt DESC")
    List<Incident> findIncidentsBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}