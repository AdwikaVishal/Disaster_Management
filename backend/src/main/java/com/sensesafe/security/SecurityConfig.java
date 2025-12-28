package com.sensesafe.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with our custom configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Disable CSRF for stateless API
                .csrf(csrf -> csrf.disable())
                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                // Stateless session
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Authorization rules
                .authorizeHttpRequests(authz -> authz
                        // Allow all OPTIONS requests (preflight) without authentication
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/websocket/**").permitAll()
                        .requestMatchers("/api/emergency/sos").permitAll()
                        .requestMatchers("/api/incidents/**").permitAll()

                        // Admin only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/blockchain/**").hasRole("ADMIN")
                        .requestMatchers("/api/volunteers/applications/review/**").hasRole("ADMIN")

                        // User and Admin endpoints
                        .requestMatchers("/api/users/profile/**").hasAnyRole("USER", "ADMIN", "VOLUNTEER")
                        .requestMatchers("/api/volunteers/apply").hasRole("USER")
                        .requestMatchers("/api/emergency/contacts").hasAnyRole("USER", "ADMIN", "VOLUNTEER")

                        // All other requests need authentication
                        .anyRequest().authenticated())
                // Disable frame options for H2 console
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Allowed origins - MUST be explicit when using credentials
        config.setAllowedOrigins(Arrays.asList(
                "https://disaster-management-dqqa.onrender.com",
                "https://disaster-management.onrender.com",
                "https://disaster-management-q9tn.vercel.app",
                "https://disaster-management-mauve.vercel.app",
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        
        // Allowed methods
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allowed headers
        config.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        
        // Exposed headers (headers that browser can access)
        config.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type"
        ));
        
        // Max age for preflight cache (1 hour)
        config.setMaxAge(3600L);
        
        // Register CORS configuration for all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return source;
    }
}