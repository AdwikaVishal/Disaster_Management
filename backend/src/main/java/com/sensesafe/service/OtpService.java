package com.sensesafe.service;

import com.sensesafe.model.OtpToken;
import com.sensesafe.model.User;
import com.sensesafe.repository.OtpTokenRepository;
import com.sensesafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class OtpService {

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateOtpForAdmin(String email) {
        // Verify admin user exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || userOpt.get().getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Admin user not found with email: " + email);
        }

        return generateAndSendOtp(userOpt.get());
    }

    public String generateOtpForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return generateAndSendOtp(user);
    }

    private String generateAndSendOtp(User user) {
        String email = user.getEmail();

        // Mark all existing OTPs for this email as used
        otpTokenRepository.markAllUsedByEmail(email);

        // Generate new 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(999999));

        // Save OTP token
        OtpToken otpToken = new OtpToken(email, otp);
        otpTokenRepository.save(otpToken);

        // Send OTP via email
        emailService.sendOtpEmail(email, otp, user.getFirstName());

        return "OTP sent successfully";
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<OtpToken> otpTokenOpt = otpTokenRepository.findValidOtp(email, otp, LocalDateTime.now());

        if (otpTokenOpt.isEmpty()) {
            return false;
        }

        OtpToken otpToken = otpTokenOpt.get();

        // Mark OTP as used
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        return true;
    }

    // Clean up expired OTPs every hour
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void cleanupExpiredOtps() {
        otpTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}