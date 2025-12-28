package com.sensesafe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                                "https://disaster-management.onrender.com", // Render frontend
                                "https://disaster-management-q9tn.vercel.app", // Vercel frontend (if you still test)
                                "http://localhost:5173", // Local dev
                                "https://disaster-management-mauve.vercel.app", // Added current vercel app from context
                                "https://disaster-management-dqqa.onrender.com" // New Render URL user specifically
                                                                                // mentioned
                )
                        // Note: allowedOrigins checks for exact match.
                        // Since we have specific domains, this is more secure than
                        // allowedOriginPatterns("*")
                        // which requires allowCredentials(true) to be careful.
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
