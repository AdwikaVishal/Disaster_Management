package com.sensesafe.repository;

import com.sensesafe.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    
    Optional<OtpToken> findByEmailAndOtpCodeAndUsedFalse(String email, String otpCode);
    
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email AND o.otpCode = :otpCode " +
           "AND o.used = false AND o.expiresAt > :now")
    Optional<OtpToken> findValidOtp(@Param("email") String email, 
                                   @Param("otpCode") String otpCode, 
                                   @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email AND o.used = false")
    void markAllUsedByEmail(@Param("email") String email);
}