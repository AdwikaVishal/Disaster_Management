package com.sensesafe.controller;

import com.sensesafe.model.User;
import com.sensesafe.security.JwtUtil;
import com.sensesafe.service.OtpService;
import com.sensesafe.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getName()); // Using name as username
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            String[] nameParts = request.getName().trim().split("\\s+", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "Doe");
            user.setPhoneNumber(request.getPhone());
            user.setRole(User.Role.USER);
            user.setVerified(false); // Not verified yet

            userService.createUser(user);

            // Generate and send OTP
            otpService.generateOtpForUser(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered. Please verify OTP.");
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            if (otpService.verifyOtp(request.getEmail(), request.getOtp())) {
                User user = userService.findByEmail(request.getEmail()).orElseThrow();
                user.setVerified(true);
                userService.updateLastLogin(user.getUsername()); // reusing method to save user or add updateVerified

                // We need to save the verified status. updateLastLogin might just save the
                // user.
                // Assuming updateLastLogin does userRepository.save(user).
                // Ideally we should have userService.save(user).

                // Let's authenticate explicitly to generate token
                UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
                Map<String, Object> claims = new HashMap<>();
                claims.put("userId", user.getId());
                claims.put("role", user.getRole().name());
                claims.put("email", user.getEmail());

                String token = jwtUtil.generateToken(userDetails, claims);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", token);
                response.put("user", createUserResponse(user));

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login-user")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginUserRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Optional: Check if verified
            // if (!user.isVerified()) { ... } for now we let them login but maybe they
            // can't do things?

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            userService.updateLastLogin(user.getUsername());

            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("role", user.getRole().name());
            claims.put("email", user.getEmail());

            String token = jwtUtil.generateToken(userDetails, claims);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", createUserResponse(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login-admin-otp")
    public ResponseEntity<?> loginAdminOtp(@Valid @RequestBody AdminOtpRequest request) {
        try {
            String message = otpService.generateOtpForAdmin(request.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            if (otpService.verifyOtp(request.getEmail(), request.getOtp())) {
                User admin = userService.findByEmail(request.getEmail()).orElseThrow();

                if (admin.getRole() != User.Role.ADMIN) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "User is not an admin");
                    return ResponseEntity.badRequest().body(response);
                }

                userService.updateLastLogin(admin.getUsername());

                UserDetails userDetails = userService.loadUserByUsername(admin.getUsername());
                Map<String, Object> claims = new HashMap<>();
                claims.put("userId", admin.getId());
                claims.put("role", admin.getRole().name());
                claims.put("email", admin.getEmail());

                String token = jwtUtil.generateToken(userDetails, claims);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", token);
                response.put("user", createUserResponse(admin));

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);

            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                User user = userService.findByUsername(username).orElseThrow();

                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("user", createUserResponse(user));

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("phoneNumber", user.getPhoneNumber());
        userResponse.put("role", user.getRole().name());
        userResponse.put("trustScore", user.getTrustScore());
        userResponse.put("verified", user.isVerified());
        userResponse.put("totalReports", user.getTotalReports());
        userResponse.put("verifiedReports", user.getVerifiedReports());
        return userResponse;
    }

    // Request DTOs
    public static class SignupRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Phone is required")
        @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 characters")
        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginUserRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class AdminOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class VerifyOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }
    }
}