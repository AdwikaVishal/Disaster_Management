package com.sensesafe.repository;

import com.sensesafe.model.VolunteerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerApplicationRepository extends JpaRepository<VolunteerApplication, Long> {
    
    List<VolunteerApplication> findByStatus(VolunteerApplication.ApplicationStatus status);
    
    List<VolunteerApplication> findByVolunteerType(VolunteerApplication.VolunteerType volunteerType);
    
    List<VolunteerApplication> findByUserId(Long userId);
    
    Optional<VolunteerApplication> findByUserIdAndStatus(Long userId, VolunteerApplication.ApplicationStatus status);
    
    @Query("SELECT va FROM VolunteerApplication va WHERE va.status = 'PENDING' ORDER BY va.createdAt ASC")
    List<VolunteerApplication> findPendingApplicationsOrderByDate();
    
    @Query("SELECT va FROM VolunteerApplication va WHERE va.status = 'APPROVED' AND " +
           "va.preferredLatitude IS NOT NULL AND va.preferredLongitude IS NOT NULL AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(va.preferredLatitude)) * " +
           "cos(radians(va.preferredLongitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(va.preferredLatitude)))) <= va.maxDistanceKm")
    List<VolunteerApplication> findApprovedVolunteersWithinArea(@Param("lat") Double latitude, 
                                                               @Param("lng") Double longitude);
    
    @Query("SELECT va FROM VolunteerApplication va WHERE va.status = 'APPROVED' AND va.volunteerType = :type")
    List<VolunteerApplication> findApprovedVolunteersByType(@Param("type") VolunteerApplication.VolunteerType type);
    
    @Query("SELECT COUNT(va) FROM VolunteerApplication va WHERE va.createdAt >= :startDate")
    Long countApplicationsAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT va.status, COUNT(va) FROM VolunteerApplication va GROUP BY va.status")
    List<Object[]> getApplicationStatusStatistics();
    
    @Query("SELECT va.volunteerType, COUNT(va) FROM VolunteerApplication va WHERE va.status = 'APPROVED' GROUP BY va.volunteerType")
    List<Object[]> getVolunteerTypeStatistics();
}