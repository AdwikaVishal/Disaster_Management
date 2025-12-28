package com.sensesafe.repository;

import com.sensesafe.model.EmergencyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmergencyResponseRepository extends JpaRepository<EmergencyResponse, Long> {
    
    List<EmergencyResponse> findByIncidentId(Long incidentId);
    
    List<EmergencyResponse> findByResponseType(EmergencyResponse.ResponseType responseType);
    
    List<EmergencyResponse> findByStatus(EmergencyResponse.ResponseStatus status);
    
    @Query("SELECT er FROM EmergencyResponse er WHERE er.status IN :statuses ORDER BY er.dispatchedAt DESC")
    List<EmergencyResponse> findByStatusIn(@Param("statuses") List<EmergencyResponse.ResponseStatus> statuses);
    
    @Query("SELECT er FROM EmergencyResponse er WHERE er.dispatchedAt >= :startDate ORDER BY er.dispatchedAt DESC")
    List<EmergencyResponse> findRecentResponses(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(er) FROM EmergencyResponse er WHERE er.dispatchedAt >= :startDate")
    Long countResponsesAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT er.responseType, COUNT(er) FROM EmergencyResponse er WHERE er.dispatchedAt >= :startDate GROUP BY er.responseType")
    List<Object[]> getResponseTypeStatistics(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT er.status, COUNT(er) FROM EmergencyResponse er GROUP BY er.status")
    List<Object[]> getResponseStatusStatistics();
}