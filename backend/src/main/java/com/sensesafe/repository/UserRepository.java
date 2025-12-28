package com.sensesafe.repository;

import com.sensesafe.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    List<User> findByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.enabled = true")
    List<User> findActiveUsersByRole(@Param("role") User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.trustScore >= :minTrustScore ORDER BY u.trustScore DESC")
    List<User> findByTrustScoreGreaterThanEqual(@Param("minTrustScore") Double minTrustScore);
    
    @Query("SELECT u FROM User u WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(u.latitude)) * " +
           "cos(radians(u.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(u.latitude)))) <= :radiusKm")
    List<User> findUsersWithinRadius(@Param("lat") Double latitude, 
                                   @Param("lng") Double longitude, 
                                   @Param("radiusKm") Double radiusKm);
    
    @Query("SELECT u FROM User u WHERE u.role = 'VOLUNTEER' AND u.enabled = true " +
           "AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(u.latitude)) * " +
           "cos(radians(u.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(u.latitude)))) <= :radiusKm")
    List<User> findVolunteersWithinRadius(@Param("lat") Double latitude, 
                                        @Param("lng") Double longitude, 
                                        @Param("radiusKm") Double radiusKm);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    Long countNewUsersAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT u FROM User u WHERE u.lastLogin >= :since ORDER BY u.lastLogin DESC")
    List<User> findRecentlyActiveUsers(@Param("since") LocalDateTime since);
    
    @Query("SELECT u FROM User u WHERE u.otpCode = :otpCode AND u.otpExpiry > :now")
    Optional<User> findByValidOtp(@Param("otpCode") String otpCode, @Param("now") LocalDateTime now);
}