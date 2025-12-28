package com.sensesafe.service;

import com.sensesafe.model.User;
import com.sensesafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (user.getPhoneNumber() != null && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public List<User> findUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void updateLastLogin(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public void updateTrustScore(Long userId, Double newScore) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setTrustScore(newScore);
            userRepository.save(user);
        });
    }

    public void updateUserLocation(Long userId, Double latitude, Double longitude, String address) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLatitude(latitude);
            user.setLongitude(longitude);
            user.setAddress(address);
            userRepository.save(user);
        });
    }

    public List<User> findUsersWithinRadius(Double latitude, Double longitude, Double radiusKm) {
        return userRepository.findUsersWithinRadius(latitude, longitude, radiusKm);
    }

    public List<User> findVolunteersWithinRadius(Double latitude, Double longitude, Double radiusKm) {
        return userRepository.findVolunteersWithinRadius(latitude, longitude, radiusKm);
    }

    // OTP functionality for admin login
    public String generateOtpForAdmin(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || userOpt.get().getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Admin user not found");
        }

        User admin = userOpt.get();
        String otp = String.format("%06d", new Random().nextInt(999999));
        admin.setOtpCode(otp);
        admin.setOtpExpiry(LocalDateTime.now().plusMinutes(10)); // 10 minutes expiry
        userRepository.save(admin);

        // Send OTP via email
        emailService.sendOtpEmail(admin.getEmail(), otp, admin.getFirstName());
        
        return "OTP sent to registered email";
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<User> userOpt = userRepository.findByValidOtp(otp, LocalDateTime.now());
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        if (!user.getEmail().equals(email)) {
            return false;
        }

        // Clear OTP after successful verification
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return true;
    }

    public void incrementReportCount(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setTotalReports(user.getTotalReports() + 1);
            userRepository.save(user);
        });
    }

    public void incrementVerifiedReportCount(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setVerifiedReports(user.getVerifiedReports() + 1);
            // Increase trust score for verified reports
            double newTrustScore = Math.min(100.0, user.getTrustScore() + 2.0);
            user.setTrustScore(newTrustScore);
            userRepository.save(user);
        });
    }

    public void incrementFlaggedReportCount(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setFlaggedReports(user.getFlaggedReports() + 1);
            // Decrease trust score for flagged reports
            double newTrustScore = Math.max(0.0, user.getTrustScore() - 5.0);
            user.setTrustScore(newTrustScore);
            userRepository.save(user);
        });
    }

    public List<User> getRecentlyActiveUsers(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userRepository.findRecentlyActiveUsers(since);
    }

    public Long getNewUserCount(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userRepository.countNewUsersAfter(since);
    }
}